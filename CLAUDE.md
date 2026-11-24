# MilestoneLock — CLAUDE.md

Hackathon project for **DEV</>NEXUS** (Team **Dark Matter**, Blockchain & Cybersecurity track).
Problem statement: **Freelancer ghosting after advance payments** (source: Razorpay Fix My Itch, B2B Services, Itch Score 76).

**`project.md` is the source of truth.** It holds the full product and architecture spec. This file is the short working guide. If the two disagree, follow `project.md` and update this file.
Testnet money only (Sepolia). Mainnet and real fiat custody are out of scope until the launch gates in `project.md` §13 are met.

## The idea in one paragraph

MilestoneLock is a milestone-based escrow and dispute-resolution platform for software agencies, starting in India. A client and a freelancer agree on work informally, for example over WhatsApp or LinkedIn. MilestoneLock turns that into a structured agreement: milestones with amounts, deadlines and explicit acceptance criteria. Funds are locked before work starts. The freelancer submits evidence-backed deliverables, and the client approves, requests a revision, or disputes.

Timers handle silence:
- **Freelancer ghosts:** no submission by deadline + grace period. Anyone can call `claimRefund`, and the unreleased funds go back to the client.
- **Client ghosts:** no review by the review deadline. AI checks the evidence against the acceptance criteria. Funds auto-release only if every eligibility condition passes (see AI rules); otherwise the case goes to a human arbiter.

Contested work goes through **three dispute tiers**:
1. Negotiation
2. Advisory AI review
3. An independent arbiter, whose ruling a **separate settlement signer** must authorize

**Governing principle:** no AI model, ordinary org admin, or single platform key can both decide a contested award and move the funds.

## Tech stack

| Layer | Choice |
|---|---|
| Smart contract | Solidity ^0.8.24, Hardhat 2 (toolbox, ethers v6, chai), OpenZeppelin 5 (`AccessControl`, `Pausable`, `ReentrancyGuard`, `EIP712`) |
| Networks | Hardhat local node for development, **Ethereum Sepolia** for the MVP/demo |
| Frontend | Next.js (App Router) + TypeScript (strict) + Tailwind, **wagmi + viem + RainbowKit** |
| Backend | Modular monolith: Next.js API (`/api/v1`) + a **separate worker process** |
| Database | **PostgreSQL + Prisma**, organization-scoped tenancy (Row-Level Security where supported) |
| Jobs | **Redis + BullMQ**, fed by a **transactional outbox** |
| Evidence | **Private S3-compatible storage** (MinIO locally), malware scan, server-side SHA-256, version history. Only hashes or Merkle roots go on-chain |
| AI review | Claude API adapter. Strict JSON output, model and prompt versions recorded, advisory only |
| Chain code (backend) | viem; relayer for automation/evidence-anchor transactions; event indexer with confirmations |
| Payments | `SettlementAdapter` boundary: `SepoliaSettlementAdapter` (MVP) and `LicensedPaymentSettlementAdapter` (stub; production fiat via a licensed partner) |
| Ops | Docker; Sentry plus metrics; separate Local, Staging/Sepolia and Production environments |

Not used: Polygon, Solana. MilestoneLock is never the production custodian of pooled customer funds.

## Smart contract: `web3/contracts/MilestoneEscrow.sol`

One contract holds every escrow.

**Deployed (Sepolia):** `0xb68B276D9bCCa40BFb7045Ba520dB2651CC9AD59`

**Roles:**

| Role | Used for |
|---|---|
| `DEFAULT_ADMIN_ROLE` | Configuration (should be a Safe multisig in production) |
| `PAUSER_ROLE` | `pause` / `unpause` |
| `ARBITER_ROLE` | Signs rulings |
| `SETTLEMENT_SIGNER_ROLE` | Signs settlement authorizations |
| `AUTOMATION_ROLE` | Backend keeper: `autoRelease`, `recordAIReview` |
| `EVIDENCE_ANCHOR_ROLE` | Backend: `anchorEvidence` |

**Lifecycle functions:**
- `createEscrow(freelancer, amounts[], workWindow, reviewWindow)` is payable, and `msg.value` must equal the sum. `freelancer = address(0)` means an open invite. Max 20 milestones.
- `accept(id)` is called by the freelancer and starts milestone 0's deadline.
- `cancel(id)` is client-only, before anyone accepts.
- `submitProof(id, cid)` is called by the freelancer before the deadline.
- `approve(id)` is called by the client.
- `reject(id, reason)` is called by the client. The first rejection grants one revision with a fresh deadline; the second opens a dispute at Tier 1.

**Silence functions:**
- `claimRefund(id)` can be called by anyone after deadline + `gracePeriod` if nothing was submitted. It refunds every remaining milestone.
- `autoRelease(id, aiPassed)` is `AUTOMATION_ROLE` only, after the review deadline. If `aiPassed` is true, the freelancer is paid. If false, the dispute goes straight to Tier 3.

**Dispute functions:**
- Tier 1: `proposeOffer(id, freelancerAmount)` and `acceptOffer(id)`, called by the client or freelancer within `negotiationWindow`. The counterparty must be the one to accept.
- Tier 2: `recordAIReview(id, reportHash, eligible)`, `AUTOMATION_ROLE` only, after negotiation expires. It stores a hash and moves no funds.
- Tier 3: `resolveDispute(Ruling, arbiterSig, signerSig)`, which anyone can submit.
  - It needs an EIP-712 `Ruling` signed by an `ARBITER_ROLE` key, plus `SettlementAuthorization(bytes32 rulingDigest)` signed by a **different** `SETTLEMENT_SIGNER_ROLE` key.
  - Nonces are global, and each ruling has a deadline.
  - The EIP-712 domain is `"MilestoneLock"`, version `"1"`.

**Other functions:**
- `anchorEvidence(id, milestoneId, root)`
- `withdraw()`: pull payments from `credits[addr]`. It works even while paused.
- `pause()` / `unpause()`

**Views:** `escrows(id)`, `getMilestones(id)`, `getMilestone(id, i)`, `disputes(id, i)`, `credits(addr)`, `usedNonces(n)`, `rulingDigest(r)`, `escrowCount()`.

**On-chain enums:**

| Enum | Values |
|---|---|
| Escrow | `Open, Active, Completed, Refunded, Cancelled` |
| Milestone | `Pending, Submitted, Released, Refunded, Disputed` |
| DisputeTier | `None, Negotiation, Arbitration, Settled` |
| ResolutionType | `MutualSettlement, HumanArbitration, ObjectiveSilence, Refund` |

The off-chain state vocabulary in `project.md` §6 (`DRAFT`, `AWAITING_FUNDING`, `IN_PROGRESS`, `REVISION_REQUESTED`, `SETTLEMENT_PENDING`, …) lives in Postgres and maps onto these.

**Contract rules (project.md §8 invariants):**
- Every ETH-moving path is `nonReentrant` and follows checks-effects-interactions.
- Money only leaves through `withdraw()`.
- Use custom errors, not revert strings. Emit an event for every state change; the backend indexer reads them.
- Freelancer award + client award must equal the frozen milestone balance.
- Disputed milestones cannot use ordinary release or refund.
- A settlement executes exactly once.
- Reminders at 50% of a window happen off-chain; the contract only enforces hard deadlines.

**Known gaps and launch blockers:**
- `_validateAllocation` is still a `TODO(human)` stub that always reverts. Until it's implemented, `resolveDispute` (Tier 3) cannot succeed, and 10 of the 46 tests fail.
- A freelancer cannot open a dispute on-chain. Disputes start only from the client's second rejection or a failed `autoRelease`.
- Amounts are in wei. The provider rail uses paise (integer minor units). Never show Sepolia transactions as real payments.

## AI rules (project.md §7)

- **Advisory only.** AI never holds keys, signs transactions, authorizes payouts, or decides subjective quality.
- **Output is strict JSON**, validated server-side, with these fields:
  - verdict
  - confidence
  - findings
  - missing_evidence
  - contradictions
  - evidence_refs
  - model_version
  - prompt_version
  - auto_resolution_eligible
- **Uploaded content is untrusted input.**
- **Auto-release requires every condition below**, otherwise the case goes to a human arbiter:
  - client silent
  - work submitted
  - structured criteria
  - evidence integrity verified
  - objective checks pass
  - no objection
  - no conflicting evidence
  - confidence ≥ 0.95
  - milestone value within the limit (₹5,000 policy; set a wei equivalent for the demo)
- **Auto-release is off by default in production.** It sits behind a feature flag and needs org consent.

## Roles and permissions (project.md §3)

- **Org membership:** `OWNER`, `ADMIN`, `PROJECT_MANAGER`, `BILLING_MANAGER`, `MEMBER`.
- **Escrow participants:** Client, Freelancer.
- **Platform roles**, kept separate from org membership: Independent Arbiter, Settlement Signer, Super Admin.
- **Server-side authorization is mandatory.** The UI only hides actions; the API enforces role, org context, case membership, state guards and separation of duties.
- **Users sign their own transactions** in their wallets. The backend never holds client or freelancer keys.

## Project layout

```
MIlesstone/
├── CLAUDE.md, README.md, project.md, change log.md
├── backend-design.md   # backend design doc (in progress)
├── web3/               # Hardhat project (was contracts/)
│   ├── contracts/      # MilestoneEscrow.sol, mocks/ReentrantReceiver.sol (test-only)
│   ├── test/           # lifecycle, silence (ghosting/revision), disputes (3 tiers), security
│   ├── scripts/        # deploy.ts, onchain-test.ts
│   └── hardhat.config.ts
└── web/                # planned: Next.js app + API + worker + Prisma
```

Git: `main` holds everything. The `web` branch is intentionally empty.

## Commands

```bash
cd web3
npx hardhat compile
npx hardhat test                                         # time.increase fast-forwards deadlines
npx hardhat node                                         # local chain
npx hardhat run scripts/deploy.ts --network localhost
npx hardhat run scripts/onchain-test.ts --network localhost   # 3 live scenarios, prints tx hashes
npx hardhat run scripts/onchain-test.ts --network sepolia     # ~3 min, real-time waits
# EXISTING_CONTRACT=0x... reuses a deployed contract
```

## Environment variables (never commit `.env`)

- **`web3/.env`:**
  - `SEPOLIA_RPC_URL`
  - `DEPLOYER_PRIVATE_KEY` (a dedicated testnet wallet, never a main account)
  - `ETHERSCAN_API_KEY`
  - `ARBITER_ADDRESS`, `SETTLEMENT_SIGNER_ADDRESS` (must be two different addresses)
  - `AUTOMATION_ADDRESS` (defaults to the deployer)
  - `GRACE_PERIOD_SECONDS`, `NEGOTIATION_WINDOW_SECONDS`
- **Backend (planned):**
  - `DATABASE_URL`, `REDIS_URL`
  - S3 endpoint and credentials
  - `ANTHROPIC_API_KEY`
  - relayer keys for `AUTOMATION_ROLE` and `EVIDENCE_ANCHOR_ROLE`
  - email provider key
- **Key custody:** production settlement and relayer keys belong in KMS, an HSM or a restricted signer service, not in plain env vars.
- **Timers:** `project.md` §6 defaults are client approval 72 h, negotiation 72 h, evidence 48 h, and arbiter 6 h to accept / 24 h for initial review / 72 h to rule. For the demo, use short windows (about 60–120 s) so the full flow runs live in a few minutes.

## Working agreements

- **Ask before changing the layout.** Ask before creating files or folders outside the layout above; the team decides the directory structure.
- **Build order** (project.md §14):
  1. Contract + tests
  2. Backend foundation: Postgres/Prisma, tenancy, auth
  3. Dispute engine: negotiation, evidence, outbox/BullMQ deadlines, event ingestion
  4. AI review + arbitration + signer authorization
  5. Role dashboards + Sepolia demo
- **Contract changes need tests.** Every contract change needs a passing test, especially both ghosting paths and every dispute tier.
- **Jobs and state:**
  - Make jobs idempotent and commit them with their state change (outbox).
  - Store deadlines as immutable UTC.
  - A timer firing never implies a transition by itself; re-check on-chain state before acting.
- **Audit everything.** Every state transition records actor, timestamp, reason and an audit event.
- **MVP non-goals:**
  - production custody or fiat settlement
  - stablecoins
  - external arbitration integrations (evidence export only)
  - arbitrator marketplace
  - fully autonomous AI adjudication
  - multi-arbiter panels
  - native mobile
  - white-label
  - international corridors
  - mainnet
- **Cut first if the schedule slips:** WhatsApp integration, the white-label widget, and external arbitration (keep its design only).

## Demo script

1. The client creates a 3-milestone escrow and locks test ETH. Show the locked balance.
2. Share the invite link in a WhatsApp chat. The freelancer connects a wallet and accepts.
3. The freelancer uploads evidence. The file is stored privately and hashed; the commitment goes on-chain (`submitProof` / `anchorEvidence`). Show it on Etherscan.
4. The client goes silent. The keeper runs the AI review, the eligibility checks pass, and `autoRelease` pays the freelancer.
5. On the next milestone, the client rejects twice. Tier 1 negotiation then settles by mutual offer, or expires, and AI review and an arbiter ruling with a separate signer authorization follow. Tier 3 needs `_validateAllocation` implemented first.
6. On the last milestone, the freelancer goes silent, and `claimRefund` returns the remaining funds to the client.
