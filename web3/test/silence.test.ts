import { expect } from "chai";
import { ethers } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { AMOUNTS, TOTAL, WORK, REVIEW, GRACE, EscrowStatus, MStatus, Tier, activeEscrow, submit } from "./helpers";

describe("Timers: ghosting paths and revision", () => {
  describe("freelancer ghosts -> claimRefund", () => {
    it("refunds ALL unreleased funds to the client after deadline + grace; anyone may call", async () => {
      const { escrow, client, stranger, id } = await loadFixture(activeEscrow);
      await time.increase(WORK + GRACE + 1);
      await expect(escrow.connect(stranger).claimRefund(id)).to.emit(escrow, "Refunded").withArgs(id, client.address, TOTAL, stranger.address);
      expect(await escrow.credits(client.address)).to.equal(TOTAL);
      expect((await escrow.escrows(id)).status).to.equal(EscrowStatus.Refunded);
      for (const m of await escrow.getMilestones(id)) expect(m.status).to.equal(MStatus.Refunded);
    });

    it("reverts before deadline + grace (inside the grace period)", async () => {
      const { escrow, id } = await loadFixture(activeEscrow);
      await time.increase(WORK + 1); // past deadline but within grace
      await expect(escrow.claimRefund(id)).to.be.revertedWithCustomError(escrow, "DeadlineNotPassed");
    });

    it("after milestone 0 is released, only milestones 1 and 2 are refunded", async () => {
      const f = await loadFixture(activeEscrow);
      const { escrow, client, freelancer, id } = f;
      await submit(f);
      await escrow.connect(client).approve(id);
      await time.increase(WORK + GRACE + 1);
      await escrow.claimRefund(id);
      expect(await escrow.credits(client.address)).to.equal(AMOUNTS[1] + AMOUNTS[2]);
      expect(await escrow.credits(freelancer.address)).to.equal(AMOUNTS[0]);
      const ms = await escrow.getMilestones(id);
      expect(ms[0].status).to.equal(MStatus.Released);
      expect(ms[1].status).to.equal(MStatus.Refunded);
    });

    it("cannot refund when the freelancer already submitted", async () => {
      const f = await loadFixture(activeEscrow);
      await submit(f);
      await time.increase(WORK + GRACE + 1);
      await expect(f.escrow.claimRefund(f.id)).to.be.revertedWithCustomError(f.escrow, "WrongMilestoneStatus");
    });

    it("cannot refund twice", async () => {
      const { escrow, id } = await loadFixture(activeEscrow);
      await time.increase(WORK + GRACE + 1);
      await escrow.claimRefund(id);
      await expect(escrow.claimRefund(id)).to.be.revertedWithCustomError(escrow, "WrongEscrowStatus");
    });
  });

  describe("client ghosts -> autoRelease", () => {
    it("AI pass: pays the freelancer and starts the next milestone", async () => {
      const f = await loadFixture(activeEscrow);
      const { escrow, automation, freelancer, id } = f;
      await submit(f);
      await time.increase(REVIEW + 1);
      await expect(escrow.connect(automation).autoRelease(id, true)).to.emit(escrow, "AutoReleased").withArgs(id, 0, true);
      expect(await escrow.credits(freelancer.address)).to.equal(AMOUNTS[0]);
      expect((await escrow.escrows(id)).current).to.equal(1n);
    });

    it("AI fail: freezes the milestone straight into Tier 3 arbitration, no money moves", async () => {
      const f = await loadFixture(activeEscrow);
      const { escrow, automation, freelancer, client, id } = f;
      await submit(f);
      await time.increase(REVIEW + 1);
      await escrow.connect(automation).autoRelease(id, false);
      expect((await escrow.getMilestone(id, 0)).status).to.equal(MStatus.Disputed);
      expect((await escrow.disputes(id, 0)).tier).to.equal(Tier.Arbitration);
      expect(await escrow.credits(freelancer.address)).to.equal(0n);
      expect(await escrow.credits(client.address)).to.equal(0n);
      await expect(escrow.connect(client).approve(id)).to.be.revertedWithCustomError(escrow, "WrongMilestoneStatus");
    });

    it("is automation-only and not before the review deadline", async () => {
      const f = await loadFixture(activeEscrow);
      const { escrow, automation, stranger, id } = f;
      await submit(f);
      await expect(escrow.connect(automation).autoRelease(id, true)).to.be.revertedWithCustomError(escrow, "DeadlineNotPassed");
      await time.increase(REVIEW + 1);
      await expect(escrow.connect(stranger).autoRelease(id, true)).to.be.revertedWithCustomError(escrow, "AccessControlUnauthorizedAccount");
    });

    it("client may still approve after the review deadline until autoRelease runs", async () => {
      const f = await loadFixture(activeEscrow);
      await submit(f);
      await time.increase(REVIEW + 1);
      await f.escrow.connect(f.client).approve(f.id);
      expect((await f.escrow.getMilestone(f.id, 0)).status).to.equal(MStatus.Released);
    });
  });

  describe("client rejects", () => {
    it("1st rejection grants one revision with a fresh deadline", async () => {
      const f = await loadFixture(activeEscrow);
      const { escrow, client, freelancer, id } = f;
      await submit(f);
      await time.increase(WORK - 10); // near the original deadline
      await expect(escrow.connect(client).reject(id, "fix X")).to.emit(escrow, "RevisionGranted");
      const m = await escrow.getMilestone(id, 0);
      expect(m.status).to.equal(MStatus.Pending);
      expect(m.rejections).to.equal(1);
      expect(m.deadline).to.be.gt(BigInt(await time.latest()) + BigInt(WORK) - 5n);
      await escrow.connect(freelancer).submitProof(id, "bafy-v2"); // allowed again
    });

    it("2nd rejection opens a Tier 1 dispute and freezes the milestone", async () => {
      const f = await loadFixture(activeEscrow);
      const { escrow, client, id } = f;
      await submit(f);
      await escrow.connect(client).reject(id, "1");
      await submit(f);
      await expect(escrow.connect(client).reject(id, "2")).to.emit(escrow, "DisputeOpened").withArgs(id, 0, Tier.Negotiation);
      expect((await escrow.getMilestone(id, 0)).status).to.equal(MStatus.Disputed);
      expect((await escrow.disputes(id, 0)).tier).to.equal(Tier.Negotiation);
    });

    it("a freelancer who misses the revision deadline can be refunded", async () => {
      const f = await loadFixture(activeEscrow);
      await submit(f);
      await f.escrow.connect(f.client).reject(f.id, "1");
      await time.increase(WORK + GRACE + 1);
      await f.escrow.claimRefund(f.id);
      expect(await f.escrow.credits(f.client.address)).to.equal(TOTAL);
    });
  });
});
