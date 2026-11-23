import { expect } from "chai";
import { ethers } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { AMOUNTS, TOTAL, WORK, REVIEW, GRACE, MStatus, deployFixture, activeEscrow, submit } from "./helpers";

describe("Access control, pause, evidence, reentrancy, conservation", () => {
  it("roles: only admin grants; only pauser pauses", async () => {
    const { escrow, stranger, admin } = await loadFixture(deployFixture);
    await expect(escrow.connect(stranger).grantRole(await escrow.ARBITER_ROLE(), stranger.address)).to.be.revertedWithCustomError(escrow, "AccessControlUnauthorizedAccount");
    await expect(escrow.connect(stranger).pause()).to.be.revertedWithCustomError(escrow, "AccessControlUnauthorizedAccount");
    await escrow.connect(admin).pause();
    expect(await escrow.paused()).to.equal(true);
  });

  it("pause blocks state changes but never traps withdrawals", async () => {
    const f = await loadFixture(activeEscrow);
    const { escrow, admin, client, freelancer, id } = f;
    await submit(f);
    await escrow.connect(client).approve(id); // credits freelancer
    await escrow.connect(admin).pause();
    await expect(escrow.connect(client).createEscrow(freelancer.address, AMOUNTS, WORK, REVIEW, { value: TOTAL })).to.be.revertedWithCustomError(escrow, "EnforcedPause");
    await expect(escrow.connect(client).approve(id)).to.be.revertedWithCustomError(escrow, "EnforcedPause");
    await expect(escrow.connect(freelancer).withdraw()).to.changeEtherBalance(freelancer, AMOUNTS[0]);
    await escrow.connect(admin).unpause();
    await submit(f); // works again
  });

  it("evidence anchoring: role-gated, stores only the root, bad milestone reverts", async () => {
    const { escrow, anchor, stranger, id } = await loadFixture(activeEscrow);
    const root = ethers.id("merkle-root");
    await expect(escrow.connect(stranger).anchorEvidence(id, 0, root)).to.be.revertedWithCustomError(escrow, "AccessControlUnauthorizedAccount");
    await expect(escrow.connect(anchor).anchorEvidence(id, 0, root)).to.emit(escrow, "EvidenceAnchored").withArgs(id, 0, root);
    expect((await escrow.getMilestone(id, 0)).evidenceRoot).to.equal(root);
    await expect(escrow.connect(anchor).anchorEvidence(id, 9, root)).to.be.reverted;
  });

  it("withdraw: nothing to withdraw reverts; second withdraw reverts", async () => {
    const f = await loadFixture(activeEscrow);
    const { escrow, client, freelancer, id } = f;
    await expect(escrow.connect(freelancer).withdraw()).to.be.revertedWithCustomError(escrow, "NothingToWithdraw");
    await submit(f);
    await escrow.connect(client).approve(id);
    await escrow.connect(freelancer).withdraw();
    await expect(escrow.connect(freelancer).withdraw()).to.be.revertedWithCustomError(escrow, "NothingToWithdraw");
  });

  it("reentrancy: a malicious receiver cannot withdraw twice from its receive hook", async () => {
    const { escrow, client } = await loadFixture(deployFixture);
    const Attacker = await ethers.getContractFactory("ReentrantReceiver");
    const attacker = await Attacker.deploy(await escrow.getAddress());
    const attackerAddr = await attacker.getAddress();

    // Two escrows so the contract holds more ETH than the attacker is owed (bait for a double-spend).
    await escrow.connect(client).createEscrow(attackerAddr, [ethers.parseEther("1")], WORK, REVIEW, { value: ethers.parseEther("1") });
    await escrow.connect(client).createEscrow(ethers.Wallet.createRandom().address, [ethers.parseEther("5")], WORK, REVIEW, { value: ethers.parseEther("5") });
    await attacker.accept(0);
    await attacker.submit(0);
    await escrow.connect(client).approve(0);

    await attacker.attack();
    expect(await attacker.reentries()).to.equal(1n); // hook ran...
    expect(await attacker.reentrySucceeded()).to.equal(false); // ...but re-entry was blocked
    expect(await ethers.provider.getBalance(attackerAddr)).to.equal(ethers.parseEther("1"));
    expect(await ethers.provider.getBalance(await escrow.getAddress())).to.equal(ethers.parseEther("5"));
  });

  it("conservation: amount = released + refunded + remaining holds after a mixed run, and the contract balance equals unclaimed credits + remaining", async () => {
    const f = await loadFixture(activeEscrow);
    const { escrow, client, id } = f;
    await submit(f);
    await escrow.connect(client).approve(id); // ms0 released
    await time.increase(WORK + GRACE + 1);
    await escrow.claimRefund(id); // ms1 + ms2 refunded

    let released = 0n, refunded = 0n, remaining = 0n;
    for (const m of await escrow.getMilestones(id)) {
      if (m.status === BigInt(MStatus.Released)) released += m.amount;
      else if (m.status === BigInt(MStatus.Refunded)) refunded += m.amount;
      else remaining += m.amount;
    }
    expect(released + refunded + remaining).to.equal(TOTAL);
    expect(remaining).to.equal(0n);
    expect(await ethers.provider.getBalance(await escrow.getAddress()))
      .to.equal((await escrow.credits(f.freelancer.address)) + (await escrow.credits(client.address)));
  });
});
