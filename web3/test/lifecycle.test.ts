import { expect } from "chai";
import { ethers } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { AMOUNTS, TOTAL, WORK, REVIEW, EscrowStatus, MStatus, deployFixture, activeEscrow, submit } from "./helpers";

describe("Lifecycle: happy path, create, accept, cancel", () => {
  it("creates, accepts, submits and approves all 3 milestones, then pays out by pull withdrawal", async () => {
    const f = await loadFixture(activeEscrow);
    const { escrow, client, freelancer, id } = f;
    expect(await ethers.provider.getBalance(await escrow.getAddress())).to.equal(TOTAL);

    for (let i = 0; i < 3; i++) {
      await submit(f);
      await expect(escrow.connect(client).approve(id)).to.emit(escrow, "MilestoneApproved").withArgs(id, i, AMOUNTS[i]);
    }
    const e = await escrow.escrows(id);
    expect(e.status).to.equal(EscrowStatus.Completed);
    expect(await escrow.credits(freelancer.address)).to.equal(TOTAL);

    await expect(escrow.connect(freelancer).withdraw()).to.changeEtherBalance(freelancer, TOTAL);
    expect(await escrow.credits(freelancer.address)).to.equal(0n);
    expect(await ethers.provider.getBalance(await escrow.getAddress())).to.equal(0n);
  });

  it("milestones run one at a time: next clock starts only after approval", async () => {
    const f = await loadFixture(activeEscrow);
    const { escrow, client, id } = f;
    expect((await escrow.getMilestone(id, 1)).deadline).to.equal(0n);
    await submit(f);
    await escrow.connect(client).approve(id);
    expect((await escrow.getMilestone(id, 1)).deadline).to.be.gt(0n);
    expect((await escrow.escrows(id)).current).to.equal(1n);
  });

  it("rejects wrong funding, empty milestones, self-as-freelancer and zero windows", async () => {
    const { escrow, client, freelancer } = await loadFixture(deployFixture);
    const c = escrow.connect(client);
    await expect(c.createEscrow(freelancer.address, AMOUNTS, WORK, REVIEW, { value: TOTAL - 1n })).to.be.revertedWithCustomError(escrow, "InvalidAmounts");
    await expect(c.createEscrow(freelancer.address, [], WORK, REVIEW)).to.be.revertedWithCustomError(escrow, "InvalidAmounts");
    await expect(c.createEscrow(freelancer.address, [0n], WORK, REVIEW)).to.be.revertedWithCustomError(escrow, "InvalidAmounts");
    await expect(c.createEscrow(client.address, AMOUNTS, WORK, REVIEW, { value: TOTAL })).to.be.revertedWithCustomError(escrow, "InvalidFreelancer");
    await expect(c.createEscrow(freelancer.address, AMOUNTS, 0, REVIEW, { value: TOTAL })).to.be.revertedWithCustomError(escrow, "InvalidWindow");
  });

  it("open invite: first non-client acceptor becomes the freelancer", async () => {
    const { escrow, client, freelancer, stranger } = await loadFixture(deployFixture);
    await escrow.connect(client).createEscrow(ethers.ZeroAddress, AMOUNTS, WORK, REVIEW, { value: TOTAL });
    await expect(escrow.connect(client).accept(0)).to.be.revertedWithCustomError(escrow, "InvalidFreelancer");
    await escrow.connect(freelancer).accept(0);
    expect((await escrow.escrows(0)).freelancer).to.equal(freelancer.address);
    await expect(escrow.connect(stranger).accept(0)).to.be.revertedWithCustomError(escrow, "WrongEscrowStatus");
  });

  it("named invite can only be accepted by the named freelancer", async () => {
    const { escrow, client, freelancer, stranger } = await loadFixture(deployFixture);
    await escrow.connect(client).createEscrow(freelancer.address, AMOUNTS, WORK, REVIEW, { value: TOTAL });
    await expect(escrow.connect(stranger).accept(0)).to.be.revertedWithCustomError(escrow, "NotFreelancer");
  });

  it("client cancels before accept and can withdraw everything; cannot cancel after accept", async () => {
    const { escrow, client, freelancer } = await loadFixture(deployFixture);
    await escrow.connect(client).createEscrow(freelancer.address, AMOUNTS, WORK, REVIEW, { value: TOTAL });
    await escrow.connect(client).cancel(0);
    expect(await escrow.credits(client.address)).to.equal(TOTAL);
    expect((await escrow.escrows(0)).status).to.equal(EscrowStatus.Cancelled);
    await expect(escrow.connect(freelancer).accept(0)).to.be.revertedWithCustomError(escrow, "WrongEscrowStatus");

    await escrow.connect(client).createEscrow(freelancer.address, AMOUNTS, WORK, REVIEW, { value: TOTAL });
    await escrow.connect(freelancer).accept(1);
    await expect(escrow.connect(client).cancel(1)).to.be.revertedWithCustomError(escrow, "WrongEscrowStatus");
  });

  it("submitProof: only the freelancer, non-empty cid, before the deadline", async () => {
    const f = await loadFixture(activeEscrow);
    const { escrow, client, freelancer, id } = f;
    await expect(escrow.connect(client).submitProof(id, "x")).to.be.revertedWithCustomError(escrow, "NotFreelancer");
    await expect(escrow.connect(freelancer).submitProof(id, "")).to.be.revertedWithCustomError(escrow, "EmptyProof");
    await time.increase(WORK + 1);
    await expect(escrow.connect(freelancer).submitProof(id, "x")).to.be.revertedWithCustomError(escrow, "DeadlinePassed");
  });

  it("approve: only the client, only when Submitted", async () => {
    const f = await loadFixture(activeEscrow);
    const { escrow, client, freelancer, id } = f;
    await expect(escrow.connect(client).approve(id)).to.be.revertedWithCustomError(escrow, "WrongMilestoneStatus");
    await submit(f);
    await expect(escrow.connect(freelancer).approve(id)).to.be.revertedWithCustomError(escrow, "NotClient");
    expect((await escrow.getMilestone(id, 0)).status).to.equal(MStatus.Submitted);
  });

  it("unknown escrow id reverts", async () => {
    const { escrow } = await loadFixture(deployFixture);
    await expect(escrow.escrows(5)).to.be.revertedWithCustomError(escrow, "EscrowNotFound");
  });
});
