// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/// @title MilestoneEscrow
/// @notice One contract holding every MilestoneLock escrow. Milestones run one at a time.
///         Silence is handled by timers; contested milestones go through three tiers:
///           Tier 1  negotiation (offers / counteroffers, mutual settlement)
///           Tier 2  AI review   (advisory hash only, never moves money)
///           Tier 3  arbitration (arbiter ruling + SEPARATE settlement-signer authorization)
///         All money leaves via pull withdrawals (`withdraw`), never pushed during a state change.
contract MilestoneEscrow is AccessControl, Pausable, ReentrancyGuard, EIP712 {
    // ───────────────────────────── Roles ─────────────────────────────
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant ARBITER_ROLE = keccak256("ARBITER_ROLE");
    bytes32 public constant SETTLEMENT_SIGNER_ROLE = keccak256("SETTLEMENT_SIGNER_ROLE");
    bytes32 public constant AUTOMATION_ROLE = keccak256("AUTOMATION_ROLE");
    bytes32 public constant EVIDENCE_ANCHOR_ROLE = keccak256("EVIDENCE_ANCHOR_ROLE");

    // ───────────────────────────── Types ─────────────────────────────
    enum EscrowStatus { Open, Active, Completed, Refunded, Cancelled }
    enum MilestoneStatus { Pending, Submitted, Released, Refunded, Disputed }
    /// @dev Dispute tiers. `Arbitration` is reached after Tier 2 (AI review) or directly
    ///      when the AI check of a silent client's milestone fails.
    enum DisputeTier { None, Negotiation, Arbitration, Settled }
    enum ResolutionType { MutualSettlement, HumanArbitration, ObjectiveSilence, Refund }

    struct Escrow {
        address client;
        address freelancer; // address(0) = open invite until someone accepts
        uint64 workWindow;
        uint64 reviewWindow;
        uint32 current; // index of the active milestone
        EscrowStatus status;
        uint256 total;
    }

    struct Milestone {
        uint128 amount;
        uint64 deadline; // submission deadline (set when the milestone starts / is revised)
        uint64 reviewDeadline; // set on submission
        MilestoneStatus status;
        uint8 rejections;
        string proofCid;
        bytes32 evidenceRoot;
    }

    struct Dispute {
        DisputeTier tier;
        uint64 negotiationEnd;
        address offerBy;
        uint128 offerFreelancer; // freelancer's share in the standing offer
        bool hasOffer;
        bool aiEligible;
        bytes32 aiReportHash;
        bytes32 rulingHash;
        ResolutionType resolution;
    }

    /// @dev Signed by an ARBITER_ROLE holder. Typed data (EIP-712).
    struct Ruling {
        uint256 escrowId;
        uint256 milestoneId;
        uint256 freelancerAmount;
        uint256 clientAmount;
        bytes32 rulingHash; // hash of the written reasoning stored off-chain
        uint256 nonce;
        uint256 deadline;
        ResolutionType resolutionType;
    }

    bytes32 private constant RULING_TYPEHASH = keccak256(
        "Ruling(uint256 escrowId,uint256 milestoneId,uint256 freelancerAmount,uint256 clientAmount,bytes32 rulingHash,uint256 nonce,uint256 deadline,uint8 resolutionType)"
    );
    /// @dev Signed by a SETTLEMENT_SIGNER_ROLE holder over the ruling's digest: a distinct record.
    bytes32 private constant AUTHORIZATION_TYPEHASH = keccak256("SettlementAuthorization(bytes32 rulingDigest)");

    uint256 public constant MAX_MILESTONES = 20;

    // ───────────────────────────── Storage ─────────────────────────────
    uint64 public immutable gracePeriod;
    uint64 public immutable negotiationWindow;

    uint256 public escrowCount;
    mapping(uint256 => Escrow) private _escrows;
    mapping(uint256 => Milestone[]) private _milestones;
    mapping(uint256 => mapping(uint256 => Dispute)) public disputes;
    mapping(uint256 => bool) public usedNonces;
    mapping(address => uint256) public credits;

    // ───────────────────────────── Errors ─────────────────────────────
    error InvalidAmounts();
    error InvalidWindow();
    error InvalidFreelancer();
    error EscrowNotFound();
    error WrongEscrowStatus();
    error WrongMilestoneStatus();
    error NotClient();
    error NotFreelancer();
    error NotParty();
    error DeadlinePassed();
    error DeadlineNotPassed();
    error EmptyProof();
    error WrongTier();
    error NegotiationOpen();
    error NegotiationClosed();
    error NoOffer();
    error OfferTooHigh();
    error CannotAcceptOwnOffer();
    error RulingMismatch();
    error AllocationMismatch();
    error NonceUsed();
    error RulingExpired();
    error WrongResolutionType();
    error InvalidSignature();
    error SignerNotAuthorized();
    error SameSigner();
    error NothingToWithdraw();
    error TransferFailed();

    // ───────────────────────────── Events ─────────────────────────────
    event EscrowCreated(uint256 indexed id, address indexed client, address indexed freelancer, uint256 total, uint256 milestoneCount);
    event EscrowAccepted(uint256 indexed id, address indexed freelancer);
    event EscrowCancelled(uint256 indexed id);
    event EscrowCompleted(uint256 indexed id);
    event MilestoneStarted(uint256 indexed id, uint256 indexed milestoneId, uint64 deadline);
    event ProofSubmitted(uint256 indexed id, uint256 indexed milestoneId, string cid, uint64 reviewDeadline);
    event MilestoneApproved(uint256 indexed id, uint256 indexed milestoneId, uint256 amount);
    event MilestoneRejected(uint256 indexed id, uint256 indexed milestoneId, string reason, uint8 rejections);
    event RevisionGranted(uint256 indexed id, uint256 indexed milestoneId, uint64 newDeadline);
    event AutoReleased(uint256 indexed id, uint256 indexed milestoneId, bool aiPassed);
    event Refunded(uint256 indexed id, address indexed client, uint256 amount, address indexed caller);
    event DisputeOpened(uint256 indexed id, uint256 indexed milestoneId, DisputeTier tier);
    event OfferProposed(uint256 indexed id, uint256 indexed milestoneId, address indexed by, uint256 freelancerAmount, uint256 clientAmount);
    event AIReviewRecorded(uint256 indexed id, uint256 indexed milestoneId, bytes32 reportHash, bool eligible);
    event DisputeSettled(uint256 indexed id, uint256 indexed milestoneId, ResolutionType resolution, uint256 freelancerAmount, uint256 clientAmount, bytes32 rulingHash);
    event EvidenceAnchored(uint256 indexed id, uint256 indexed milestoneId, bytes32 root);
    event Credited(address indexed account, uint256 amount);
    event Withdrawn(address indexed account, uint256 amount);

    // ───────────────────────────── Setup ─────────────────────────────
    constructor(address admin, uint64 gracePeriod_, uint64 negotiationWindow_) EIP712("MilestoneLock", "1") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        gracePeriod = gracePeriod_;
        negotiationWindow = negotiationWindow_;
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // ───────────────────────────── Lifecycle ─────────────────────────────

    /// @notice Lock the full amount, split into sequential milestones.
    /// @param freelancer address(0) creates an open invite that the first acceptor claims.
    function createEscrow(address freelancer, uint256[] calldata amounts, uint64 workWindow, uint64 reviewWindow)
        external
        payable
        whenNotPaused
        returns (uint256 id)
    {
        uint256 n = amounts.length;
        if (n == 0 || n > MAX_MILESTONES) revert InvalidAmounts();
        if (workWindow == 0 || reviewWindow == 0) revert InvalidWindow();
        if (freelancer == msg.sender) revert InvalidFreelancer();

        uint256 sum;
        for (uint256 i; i < n; ++i) {
            if (amounts[i] == 0 || amounts[i] > type(uint128).max) revert InvalidAmounts();
            sum += amounts[i];
        }
        if (sum != msg.value) revert InvalidAmounts();

        id = escrowCount++;
        _escrows[id] = Escrow({
            client: msg.sender,
            freelancer: freelancer,
            workWindow: workWindow,
            reviewWindow: reviewWindow,
            current: 0,
            status: EscrowStatus.Open,
            total: sum
        });
        for (uint256 i; i < n; ++i) {
            _milestones[id].push(
                Milestone({
                    amount: uint128(amounts[i]),
                    deadline: 0,
                    reviewDeadline: 0,
                    status: MilestoneStatus.Pending,
                    rejections: 0,
                    proofCid: "",
                    evidenceRoot: bytes32(0)
                })
            );
        }
        emit EscrowCreated(id, msg.sender, freelancer, sum, n);
    }

    /// @notice Freelancer accepts (or claims an open invite). Starts milestone 0's clock.
    function accept(uint256 id) external whenNotPaused {
        Escrow storage e = _get(id);
        if (e.status != EscrowStatus.Open) revert WrongEscrowStatus();
        if (e.freelancer == address(0)) {
            if (msg.sender == e.client) revert InvalidFreelancer();
            e.freelancer = msg.sender;
        } else if (msg.sender != e.freelancer) {
            revert NotFreelancer();
        }
        e.status = EscrowStatus.Active;
        emit EscrowAccepted(id, msg.sender);
        _startMilestone(id, 0, e.workWindow);
    }

    /// @notice Client cancels before anyone accepts; the full amount becomes withdrawable.
    function cancel(uint256 id) external whenNotPaused {
        Escrow storage e = _get(id);
        if (msg.sender != e.client) revert NotClient();
        if (e.status != EscrowStatus.Open) revert WrongEscrowStatus();
        e.status = EscrowStatus.Cancelled;
        _credit(e.client, e.total);
        emit EscrowCancelled(id);
    }

    /// @notice Freelancer submits proof (IPFS CID) for the current milestone, before its deadline.
    function submitProof(uint256 id, string calldata cid) external whenNotPaused {
        Escrow storage e = _get(id);
        if (e.status != EscrowStatus.Active) revert WrongEscrowStatus();
        if (msg.sender != e.freelancer) revert NotFreelancer();
        if (bytes(cid).length == 0) revert EmptyProof();

        Milestone storage m = _milestones[id][e.current];
        if (m.status != MilestoneStatus.Pending) revert WrongMilestoneStatus();
        if (block.timestamp > m.deadline) revert DeadlinePassed();

        m.status = MilestoneStatus.Submitted;
        m.proofCid = cid;
        m.reviewDeadline = uint64(block.timestamp) + e.reviewWindow;
        emit ProofSubmitted(id, e.current, cid, m.reviewDeadline);
    }

    /// @notice Client approves the submitted milestone; the freelancer is credited.
    function approve(uint256 id) external whenNotPaused {
        Escrow storage e = _get(id);
        if (msg.sender != e.client) revert NotClient();
        Milestone storage m = _submitted(id, e);

        m.status = MilestoneStatus.Released;
        _credit(e.freelancer, m.amount);
        emit MilestoneApproved(id, e.current, m.amount);
        _advance(id, e);
    }

    /// @notice Client rejects. 1st rejection: one revision with a fresh deadline. 2nd: dispute.
    function reject(uint256 id, string calldata reason) external whenNotPaused {
        Escrow storage e = _get(id);
        if (msg.sender != e.client) revert NotClient();
        Milestone storage m = _submitted(id, e);

        m.rejections += 1;
        emit MilestoneRejected(id, e.current, reason, m.rejections);

        if (m.rejections == 1) {
            m.status = MilestoneStatus.Pending;
            m.deadline = uint64(block.timestamp) + e.workWindow;
            emit RevisionGranted(id, e.current, m.deadline);
        } else {
            _openDispute(id, e.current, m, DisputeTier.Negotiation);
        }
    }

    // ───────────────────────────── Silence timers ─────────────────────────────

    /// @notice Freelancer ghosted: anyone may return all unreleased funds to the client
    ///         once deadline + grace has passed with nothing submitted.
    function claimRefund(uint256 id) external nonReentrant whenNotPaused {
        Escrow storage e = _get(id);
        if (e.status != EscrowStatus.Active) revert WrongEscrowStatus();
        Milestone[] storage ms = _milestones[id];
        if (ms[e.current].status != MilestoneStatus.Pending) revert WrongMilestoneStatus();
        if (block.timestamp <= uint256(ms[e.current].deadline) + gracePeriod) revert DeadlineNotPassed();

        uint256 refund;
        for (uint256 i = e.current; i < ms.length; ++i) {
            if (ms[i].status == MilestoneStatus.Pending) {
                ms[i].status = MilestoneStatus.Refunded;
                refund += ms[i].amount;
            }
        }
        e.status = EscrowStatus.Refunded;
        _credit(e.client, refund);
        emit Refunded(id, e.client, refund, msg.sender);
    }

    /// @notice Client ghosted past the review deadline. The backend ran the AI proof check.
    ///         Pass: freelancer is paid. Fail: straight to Tier 3 arbitration.
    function autoRelease(uint256 id, bool aiPassed) external onlyRole(AUTOMATION_ROLE) whenNotPaused {
        Escrow storage e = _get(id);
        Milestone storage m = _submitted(id, e);
        if (block.timestamp <= m.reviewDeadline) revert DeadlineNotPassed();

        emit AutoReleased(id, e.current, aiPassed);
        if (aiPassed) {
            m.status = MilestoneStatus.Released;
            _credit(e.freelancer, m.amount);
            emit DisputeSettled(id, e.current, ResolutionType.ObjectiveSilence, m.amount, 0, bytes32(0));
            _advance(id, e);
        } else {
            _openDispute(id, e.current, m, DisputeTier.Arbitration);
        }
    }

    // ───────────────────── Dispute Tier 1: negotiation ─────────────────────

    /// @notice Either party proposes (or counters with) a split of the frozen milestone.
    function proposeOffer(uint256 id, uint256 freelancerAmount) external whenNotPaused {
        (Escrow storage e, Milestone storage m, Dispute storage d) = _disputed(id);
        if (msg.sender != e.client && msg.sender != e.freelancer) revert NotParty();
        if (d.tier != DisputeTier.Negotiation) revert WrongTier();
        if (block.timestamp > d.negotiationEnd) revert NegotiationClosed();
        if (freelancerAmount > m.amount) revert OfferTooHigh();

        d.hasOffer = true;
        d.offerBy = msg.sender;
        d.offerFreelancer = uint128(freelancerAmount);
        emit OfferProposed(id, e.current, msg.sender, freelancerAmount, m.amount - freelancerAmount);
    }

    /// @notice The other party accepts the standing offer: mutual settlement.
    function acceptOffer(uint256 id) external whenNotPaused {
        (Escrow storage e, Milestone storage m, Dispute storage d) = _disputed(id);
        if (msg.sender != e.client && msg.sender != e.freelancer) revert NotParty();
        if (d.tier != DisputeTier.Negotiation) revert WrongTier();
        if (block.timestamp > d.negotiationEnd) revert NegotiationClosed();
        if (!d.hasOffer) revert NoOffer();
        if (msg.sender == d.offerBy) revert CannotAcceptOwnOffer();

        uint256 f = d.offerFreelancer;
        _settle(id, f, m.amount - f, ResolutionType.MutualSettlement, bytes32(0));
    }

    // ───────────────────── Dispute Tier 2: AI review (advisory) ─────────────────────

    /// @notice After negotiation expires, the backend records the AI review's hash. No funds move;
    ///         the case then waits for an arbiter.
    function recordAIReview(uint256 id, bytes32 reportHash, bool eligible) external onlyRole(AUTOMATION_ROLE) whenNotPaused {
        (Escrow storage e,, Dispute storage d) = _disputed(id);
        if (d.tier != DisputeTier.Negotiation) revert WrongTier();
        if (block.timestamp <= d.negotiationEnd) revert NegotiationOpen();

        d.tier = DisputeTier.Arbitration;
        d.aiReportHash = reportHash;
        d.aiEligible = eligible;
        emit AIReviewRecorded(id, e.current, reportHash, eligible);
    }

    // ───────────────────── Dispute Tier 3: arbitration ─────────────────────

    /// @notice Settle with an arbiter's EIP-712 ruling AND a different settlement signer's
    ///         separate authorization of that ruling. Anyone may submit the pair.
    function resolveDispute(Ruling calldata r, bytes calldata arbiterSig, bytes calldata signerSig)
        external
        nonReentrant
        whenNotPaused
    {
        (Escrow storage e, Milestone storage m, Dispute storage d) = _disputed(r.escrowId);
        if (r.milestoneId != e.current) revert RulingMismatch();
        if (d.tier != DisputeTier.Arbitration) revert WrongTier();
        if (r.resolutionType != ResolutionType.HumanArbitration) revert WrongResolutionType();
        if (block.timestamp > r.deadline) revert RulingExpired();
        if (usedNonces[r.nonce]) revert NonceUsed();
        _validateAllocation(m.amount, r.freelancerAmount, r.clientAmount);
        _verifySignatures(r, arbiterSig, signerSig);

        usedNonces[r.nonce] = true;
        _settle(r.escrowId, r.freelancerAmount, r.clientAmount, r.resolutionType, r.rulingHash);
    }

    /// @dev Arbiter signs the ruling; a DIFFERENT settlement signer signs an authorization of it.
    function _verifySignatures(Ruling calldata r, bytes calldata arbiterSig, bytes calldata signerSig) private view {
        bytes32 rDigest = _rulingDigest(r);
        address arbiter = _recover(rDigest, arbiterSig);
        if (!hasRole(ARBITER_ROLE, arbiter)) revert SignerNotAuthorized();

        bytes32 authDigest = _hashTypedDataV4(keccak256(abi.encode(AUTHORIZATION_TYPEHASH, rDigest)));
        address signer = _recover(authDigest, signerSig);
        if (!hasRole(SETTLEMENT_SIGNER_ROLE, signer)) revert SignerNotAuthorized();
        if (signer == arbiter) revert SameSigner();
    }

    /// @notice Digest the arbiter must sign (settlement signer signs the authorization of this digest).
    function rulingDigest(Ruling calldata r) external view returns (bytes32) {
        return _rulingDigest(r);
    }

    // ───────────────────────────── Evidence & funds ─────────────────────────────

    /// @notice Anchor a hash / Merkle root of private evidence. Never the content itself.
    function anchorEvidence(uint256 id, uint256 milestoneId, bytes32 root) external onlyRole(EVIDENCE_ANCHOR_ROLE) whenNotPaused {
        _get(id);
        if (milestoneId >= _milestones[id].length) revert WrongMilestoneStatus();
        _milestones[id][milestoneId].evidenceRoot = root;
        emit EvidenceAnchored(id, milestoneId, root);
    }

    /// @notice Pull withdrawal. The only function that sends ETH. Works even while paused,
    ///         so a pause can never trap funds.
    function withdraw() external nonReentrant {
        uint256 amount = credits[msg.sender];
        if (amount == 0) revert NothingToWithdraw();
        credits[msg.sender] = 0; // effects before interaction
        (bool ok,) = msg.sender.call{value: amount}("");
        if (!ok) revert TransferFailed();
        emit Withdrawn(msg.sender, amount);
    }

    // ───────────────────────────── Views ─────────────────────────────

    function escrows(uint256 id) external view returns (Escrow memory) {
        return _get(id);
    }

    function getMilestones(uint256 id) external view returns (Milestone[] memory) {
        _get(id);
        return _milestones[id];
    }

    function getMilestone(uint256 id, uint256 i) external view returns (Milestone memory) {
        _get(id);
        return _milestones[id][i];
    }

    // ───────────────────────────── Internals ─────────────────────────────

    /// @dev Ruling is all static fields, so abi.encode(typehash, r) equals the EIP-712 struct encoding.
    function _rulingDigest(Ruling calldata r) private view returns (bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(RULING_TYPEHASH, r)));
    }

    function _get(uint256 id) private view returns (Escrow storage e) {
        if (id >= escrowCount) revert EscrowNotFound();
        e = _escrows[id];
    }

    /// @dev Active escrow whose current milestone is Submitted.
    function _submitted(uint256 id, Escrow storage e) private view returns (Milestone storage m) {
        if (e.status != EscrowStatus.Active) revert WrongEscrowStatus();
        m = _milestones[id][e.current];
        if (m.status != MilestoneStatus.Submitted) revert WrongMilestoneStatus();
    }

    /// @dev Active escrow whose current milestone is Disputed.
    function _disputed(uint256 id) private view returns (Escrow storage e, Milestone storage m, Dispute storage d) {
        e = _get(id);
        if (e.status != EscrowStatus.Active) revert WrongEscrowStatus();
        m = _milestones[id][e.current];
        if (m.status != MilestoneStatus.Disputed) revert WrongMilestoneStatus();
        d = disputes[id][e.current];
    }

    function _openDispute(uint256 id, uint256 i, Milestone storage m, DisputeTier tier) private {
        m.status = MilestoneStatus.Disputed; // freezes ordinary approve / refund / release
        Dispute storage d = disputes[id][i];
        d.tier = tier;
        if (tier == DisputeTier.Negotiation) d.negotiationEnd = uint64(block.timestamp) + negotiationWindow;
        emit DisputeOpened(id, i, tier);
    }

    function _settle(
        uint256 id,
        uint256 freelancerAmount,
        uint256 clientAmount,
        ResolutionType resolution,
        bytes32 rulingHash
    ) private {
        Escrow storage e = _escrows[id];
        uint32 i = e.current;
        Milestone storage m = _milestones[id][i];
        Dispute storage d = disputes[id][i];
        // effects
        m.status = freelancerAmount > 0 ? MilestoneStatus.Released : MilestoneStatus.Refunded;
        d.tier = DisputeTier.Settled;
        d.resolution = resolution;
        d.rulingHash = rulingHash;
        // credits (pull ledger, no external call)
        if (freelancerAmount > 0) _credit(e.freelancer, freelancerAmount);
        if (clientAmount > 0) _credit(e.client, clientAmount);
        emit DisputeSettled(id, i, resolution, freelancerAmount, clientAmount, rulingHash);
        _advance(id, e);
    }

    /// @dev Start the next milestone, or complete the escrow after the last one.
    function _advance(uint256 id, Escrow storage e) private {
        uint256 next = uint256(e.current) + 1;
        if (next >= _milestones[id].length) {
            e.status = EscrowStatus.Completed;
            emit EscrowCompleted(id);
        } else {
            e.current = uint32(next);
            _startMilestone(id, next, e.workWindow);
        }
    }

    function _startMilestone(uint256 id, uint256 i, uint64 workWindow) private {
        uint64 dl = uint64(block.timestamp) + workWindow;
        _milestones[id][i].deadline = dl;
        emit MilestoneStarted(id, i, dl);
    }

    function _credit(address to, uint256 amount) private {
        credits[to] += amount;
        emit Credited(to, amount);
    }

    function _recover(bytes32 digest, bytes calldata sig) private pure returns (address) {
        (address a, ECDSA.RecoverError err,) = ECDSA.tryRecover(digest, sig);
        if (err != ECDSA.RecoverError.NoError) revert InvalidSignature();
        return a;
    }

    /// @dev Invariant: freelancer award + client award must equal the frozen milestone balance.
    function _validateAllocation(uint256 frozen, uint256 freelancerAmount, uint256 clientAmount) private pure {
        // TODO(human): enforce the allocation rule for an arbiter ruling.
        // Revert with AllocationMismatch() when the split is not valid for the frozen balance.
        // Consider: exact conservation (no dust left locked, nothing created), and overflow.
        revert AllocationMismatch();
    }
}
