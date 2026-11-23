import { expect } from "chai";
import { ethers } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  AMOUNTS, NEGOTIATION, MStatus, Tier, Resolution, activeEscrow, openNegotiation, toArbitration,
  makeRuling, signRuling, signAuthorization,
} from "./helpers";

const M0 = AMOUNTS[0];

describe("Disputes: three tiers", () => {
  describe("Tier 1: negotiation", () => {
    it("offer, counteroffer, then acceptance settles as a mutual split and starts the next milestone", async () => {
      const f = await loadFixture(activeEscrow);
      await openNegotiation(f);
      const { escrow, client, freelancer, id } = f;
      const seventy = (M0 * 70n) / 100n;
      const fifty = M0 / 2n;

      await escrow.connect(freelancer).proposeOffer(id, seventy);
      await expect(escrow.connect(freelancer).acceptOffer(id)).to.be.revertedWithCustomError(escrow, "CannotAcceptOwnOffer");
      await escrow.connect(client).proposeOffer(id, fifty); // counteroffer replaces the standing offer
      await expect(escrow.connect(client).acceptOffer(id)).to.be.revertedWithCustomError(escrow, "CannotAcceptOwnOffer");
      await expect(escrow.connect(freelancer).acceptOffer(id))
        .to.emit(escrow, "DisputeSettled").withArgs(id, 0, Resolution.MutualSettlement, fifty, M0 - fifty, ethers.ZeroHash);

      expect(await escrow.credits(freelancer.address)).to.equal(fifty);
      expect(await escrow.credits(client.address)).to.equal(M0 - fifty);
      expect((await escrow.getMilestone(id, 0)).status).to.equal(MStatus.Released);
      expect((await escrow.disputes(id, 0)).tier).to.equal(Tier.Settled);
      expect((await escrow.escrows(id)).current).to.equal(1n);
    });

    it("a 100% client split marks the milestone Refunded", async () => {
      const f = await loadFixture(activeEscrow);
      await openNegotiation(f);
      await f.escrow.connect(f.freelancer).proposeOffer(f.id, 0);
      await f.escrow.connect(f.client).acceptOffer(f.id);
      expect((await f.escrow.getMilestone(f.id, 0)).status).to.equal(MStatus.Refunded);
      expect(await f.escrow.credits(f.client.address)).to.equal(M0);
    });

    it("rejects an offer above the frozen balance, from strangers, and accepting with no offer", async () => {
      const f = await loadFixture(activeEscrow);
      await openNegotiation(f);
      const { escrow, client, stranger, id } = f;
      await expect(escrow.connect(client).proposeOffer(id, M0 + 1n)).to.be.revertedWithCustomError(escrow, "OfferTooHigh");
      await expect(escrow.connect(stranger).proposeOffer(id, 1n)).to.be.revertedWithCustomError(escrow, "NotParty");
      await expect(escrow.connect(client).acceptOffer(id)).to.be.revertedWithCustomError(escrow, "NoOffer");
    });

    it("expiry never awards funds: offers are closed and nothing is credited", async () => {
      const f = await loadFixture(activeEscrow);
      await openNegotiation(f);
      const { escrow, client, freelancer, id } = f;
      await escrow.connect(freelancer).proposeOffer(id, M0);
      await time.increase(NEGOTIATION + 1);
      await expect(escrow.connect(client).acceptOffer(id)).to.be.revertedWithCustomError(escrow, "NegotiationClosed");
      await expect(escrow.connect(client).proposeOffer(id, 1n)).to.be.revertedWithCustomError(escrow, "NegotiationClosed");
      expect(await escrow.credits(freelancer.address)).to.equal(0n);
      expect(await escrow.credits(client.address)).to.equal(0n);
    });

    it("disputed funds are frozen against ordinary release and refund", async () => {
      const f = await loadFixture(activeEscrow);
      await openNegotiation(f);
      await expect(f.escrow.connect(f.client).approve(f.id)).to.be.revertedWithCustomError(f.escrow, "WrongMilestoneStatus");
      await time.increase(10_000);
      await expect(f.escrow.claimRefund(f.id)).to.be.revertedWithCustomError(f.escrow, "WrongMilestoneStatus");
    });
  });

  describe("Tier 2: AI review (advisory)", () => {
    it("only after negotiation expiry, only automation, moves no money, advances to the arbiter queue", async () => {
      const f = await loadFixture(activeEscrow);
      await openNegotiation(f);
      const { escrow, automation, stranger, id } = f;
      const report = ethers.id("ai-report");
      await expect(escrow.connect(automation).recordAIReview(id, report, true)).to.be.revertedWithCustomError(escrow, "NegotiationOpen");
      await time.increase(NEGOTIATION + 1);
      await expect(escrow.connect(stranger).recordAIReview(id, report, true)).to.be.revertedWithCustomError(escrow, "AccessControlUnauthorizedAccount");
      await expect(escrow.connect(automation).recordAIReview(id, report, true)).to.emit(escrow, "AIReviewRecorded").withArgs(id, 0, report, true);
      const d = await escrow.disputes(id, 0);
      expect(d.tier).to.equal(Tier.Arbitration);
      expect(d.aiReportHash).to.equal(report);
      expect(await escrow.credits(f.freelancer.address)).to.equal(0n);
      await expect(escrow.connect(automation).recordAIReview(id, report, true)).to.be.revertedWithCustomError(escrow, "WrongTier");
    });

    it("offers can no longer be accepted once the case reached Tier 3", async () => {
      const f = await loadFixture(activeEscrow);
      await toArbitration(f);
      await expect(f.escrow.connect(f.client).proposeOffer(f.id, 1n)).to.be.revertedWithCustomError(f.escrow, "WrongTier");
    });
  });

  describe("Tier 3: arbiter ruling + separate signer authorization", () => {
    async function ready() {
      const f = await loadFixture(activeEscrow);
      await toArbitration(f);
      return f;
    }

    it("settles a partial split with both signatures, records the ruling hash, credits both sides", async () => {
      const f = await ready();
      const { escrow, arbiter, signer, freelancer, client, id } = f;
      const r = await makeRuling();
      const aSig = await signRuling(escrow, arbiter, r);
      const sSig = await signAuthorization(escrow, signer, r);
      await expect(escrow.resolveDispute(r, aSig, sSig))
        .to.emit(escrow, "DisputeSettled").withArgs(id, 0, Resolution.HumanArbitration, r.freelancerAmount, r.clientAmount, r.rulingHash);
      expect(await escrow.credits(freelancer.address)).to.equal(r.freelancerAmount);
      expect(await escrow.credits(client.address)).to.equal(r.clientAmount);
      const d = await escrow.disputes(id, 0);
      expect(d.tier).to.equal(Tier.Settled);
      expect(d.rulingHash).to.equal(r.rulingHash);
      expect(d.resolution).to.equal(Resolution.HumanArbitration);
      expect((await escrow.escrows(id)).current).to.equal(1n);
    });

    it("a settlement executes only once (replay, even with a fresh nonce, fails)", async () => {
      const f = await ready();
      const { escrow, arbiter, signer } = f;
      const r = await makeRuling();
      const aSig = await signRuling(escrow, arbiter, r);
      const sSig = await signAuthorization(escrow, signer, r);
      await escrow.resolveDispute(r, aSig, sSig);
      await expect(escrow.resolveDispute(r, aSig, sSig)).to.be.reverted;
    });

    it("reused nonce on another dispute is rejected", async () => {
      const f = await ready();
      const { escrow, arbiter, signer, client, freelancer, automation } = f;
      const r = await makeRuling();
      await escrow.resolveDispute(r, await signRuling(escrow, arbiter, r), await signAuthorization(escrow, signer, r));
      // milestone 1 now active: drive it to arbitration too
      await escrow.connect(freelancer).submitProof(0, "p");
      await escrow.connect(client).reject(0, "a");
      await escrow.connect(freelancer).submitProof(0, "p");
      await escrow.connect(client).reject(0, "b");
      await time.increase(NEGOTIATION + 1);
      await escrow.connect(automation).recordAIReview(0, ethers.id("r2"), false);
      const r2 = await makeRuling({ milestoneId: 1n, freelancerAmount: 1n, clientAmount: AMOUNTS[1] - 1n, nonce: r.nonce });
      await expect(escrow.resolveDispute(r2, await signRuling(escrow, arbiter, r2), await signAuthorization(escrow, signer, r2)))
        .to.be.revertedWithCustomError(escrow, "NonceUsed");
    });

    it("rejects an allocation that does not equal the frozen balance", async () => {
      const f = await ready();
      const { escrow, arbiter, signer } = f;
      for (const [fa, ca] of [[M0, 1n], [M0 / 2n, M0 / 2n - 1n], [0n, 0n], [ethers.MaxUint256, 2n]] as const) {
        const r = await makeRuling({ freelancerAmount: fa, clientAmount: ca });
        await expect(escrow.resolveDispute(r, await signRuling(escrow, arbiter, r), await signAuthorization(escrow, signer, r)))
          .to.be.revertedWithCustomError(escrow, "AllocationMismatch");
      }
    });

    it("rejects an expired ruling", async () => {
      const f = await ready();
      const { escrow, arbiter, signer } = f;
      const r = await makeRuling({ deadline: BigInt(await time.latest()) - 1n });
      await expect(escrow.resolveDispute(r, await signRuling(escrow, arbiter, r), await signAuthorization(escrow, signer, r)))
        .to.be.revertedWithCustomError(escrow, "RulingExpired");
    });

    it("rejects a ruling signed by someone without ARBITER_ROLE", async () => {
      const f = await ready();
      const { escrow, stranger, signer } = f;
      const r = await makeRuling();
      await expect(escrow.resolveDispute(r, await signRuling(escrow, stranger, r), await signAuthorization(escrow, signer, r)))
        .to.be.revertedWithCustomError(escrow, "SignerNotAuthorized");
    });

    it("rejects an authorization signed by someone without SETTLEMENT_SIGNER_ROLE", async () => {
      const f = await ready();
      const { escrow, arbiter, stranger } = f;
      const r = await makeRuling();
      await expect(escrow.resolveDispute(r, await signRuling(escrow, arbiter, r), await signAuthorization(escrow, stranger, r)))
        .to.be.revertedWithCustomError(escrow, "SignerNotAuthorized");
    });

    it("one key cannot be both arbiter and signer (separation of duties)", async () => {
      const f = await ready();
      const { escrow, admin, arbiter } = f;
      await escrow.grantRole(await escrow.SETTLEMENT_SIGNER_ROLE(), arbiter.address);
      const r = await makeRuling();
      await expect(escrow.resolveDispute(r, await signRuling(escrow, arbiter, r), await signAuthorization(escrow, arbiter, r)))
        .to.be.revertedWithCustomError(escrow, "SameSigner");
      void admin;
    });

    it("a tampered ruling (amounts changed after signing) is rejected", async () => {
      const f = await ready();
      const { escrow, arbiter, signer } = f;
      const r = await makeRuling();
      const aSig = await signRuling(escrow, arbiter, r);
      const sSig = await signAuthorization(escrow, signer, r);
      const tampered = { ...r, freelancerAmount: M0, clientAmount: 0n };
      await expect(escrow.resolveDispute(tampered, aSig, sSig)).to.be.revertedWithCustomError(escrow, "SignerNotAuthorized");
    });

    it("the arbiter signature alone is not an authorization (signer sig over a different ruling fails)", async () => {
      const f = await ready();
      const { escrow, arbiter, signer } = f;
      const r = await makeRuling();
      const other = await makeRuling({ nonce: 99n });
      await expect(escrow.resolveDispute(r, await signRuling(escrow, arbiter, r), await signAuthorization(escrow, signer, other)))
        .to.be.revertedWithCustomError(escrow, "SignerNotAuthorized");
    });

    it("rejects garbage signatures, wrong milestone, wrong resolution type, and non-arbitration tier", async () => {
      const f = await ready();
      const { escrow, arbiter, signer } = f;
      const r = await makeRuling();
      await expect(escrow.resolveDispute(r, "0x1234", "0x1234")).to.be.revertedWithCustomError(escrow, "InvalidSignature");
      const wrongM = await makeRuling({ milestoneId: 1n });
      await expect(escrow.resolveDispute(wrongM, await signRuling(escrow, arbiter, wrongM), await signAuthorization(escrow, signer, wrongM)))
        .to.be.revertedWithCustomError(escrow, "RulingMismatch");
      const wrongT = await makeRuling({ resolutionType: Resolution.Refund });
      await expect(escrow.resolveDispute(wrongT, await signRuling(escrow, arbiter, wrongT), await signAuthorization(escrow, signer, wrongT)))
        .to.be.revertedWithCustomError(escrow, "WrongResolutionType");

      const g = await loadFixture(activeEscrow);
      await openNegotiation(g); // still Tier 1
      await expect(g.escrow.resolveDispute(r, await signRuling(g.escrow, g.arbiter, r), await signAuthorization(g.escrow, g.signer, r)))
        .to.be.revertedWithCustomError(g.escrow, "WrongTier");
    });

    it("signatures are bound to this chain/contract (a signature for another contract is invalid)", async () => {
      const f = await ready();
      const { escrow, arbiter, signer } = f;
      const r = await makeRuling();
      const wrongDomain = { name: "MilestoneLock", version: "1", chainId: 31337, verifyingContract: ethers.Wallet.createRandom().address };
      const types = {
        Ruling: [
          { name: "escrowId", type: "uint256" }, { name: "milestoneId", type: "uint256" },
          { name: "freelancerAmount", type: "uint256" }, { name: "clientAmount", type: "uint256" },
          { name: "rulingHash", type: "bytes32" }, { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" }, { name: "resolutionType", type: "uint8" },
        ],
      };
      const badSig = await arbiter.signTypedData(wrongDomain, types, r);
      await expect(escrow.resolveDispute(r, badSig, await signAuthorization(escrow, signer, r)))
        .to.be.revertedWithCustomError(escrow, "SignerNotAuthorized");
    });
  });
});
