import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import type { MilestoneEscrow } from "../typechain-types";
import type { HDNodeWallet } from "ethers";

export const GRACE = 100;
export const NEGOTIATION = 1000;
export const WORK = 1000;
export const REVIEW = 500;
export const AMOUNTS = [ethers.parseEther("1"), ethers.parseEther("2"), ethers.parseEther("3")];
export const TOTAL = AMOUNTS.reduce((a, b) => a + b, 0n);

export enum EscrowStatus { Open, Active, Completed, Refunded, Cancelled }
export enum MStatus { Pending, Submitted, Released, Refunded, Disputed }
export enum Tier { None, Negotiation, Arbitration, Settled }
export enum Resolution { MutualSettlement, HumanArbitration, ObjectiveSilence, Refund }

export async function deployFixture() {
  const [admin, client, freelancer, arbiter, signer, automation, anchor, stranger] = await ethers.getSigners();
  const Factory = await ethers.getContractFactory("MilestoneEscrow");
  const escrow = (await Factory.deploy(admin.address, GRACE, NEGOTIATION)) as MilestoneEscrow;
  await escrow.waitForDeployment();

  await escrow.grantRole(await escrow.ARBITER_ROLE(), arbiter.address);
  await escrow.grantRole(await escrow.SETTLEMENT_SIGNER_ROLE(), signer.address);
  await escrow.grantRole(await escrow.AUTOMATION_ROLE(), automation.address);
  await escrow.grantRole(await escrow.EVIDENCE_ANCHOR_ROLE(), anchor.address);

  return { escrow, admin, client, freelancer, arbiter, signer, automation, anchor, stranger };
}

/** Create + accept an escrow of 3 milestones (1, 2, 3 ETH). Returns its id (always 0 on a fresh fixture). */
export async function activeEscrow() {
  const f = await deployFixture();
  await f.escrow.connect(f.client).createEscrow(f.freelancer.address, AMOUNTS, WORK, REVIEW, { value: TOTAL });
  await f.escrow.connect(f.freelancer).accept(0);
  return { ...f, id: 0n };
}

export async function submit(f: Awaited<ReturnType<typeof activeEscrow>>) {
  await f.escrow.connect(f.freelancer).submitProof(f.id, "bafy-proof");
}

/** Drive milestone 0 into Tier 1 negotiation: submit, reject, resubmit, reject. */
export async function openNegotiation(f: Awaited<ReturnType<typeof activeEscrow>>) {
  await submit(f);
  await f.escrow.connect(f.client).reject(f.id, "not matching criteria");
  await submit(f);
  await f.escrow.connect(f.client).reject(f.id, "still wrong");
}

/** Take a negotiation to Tier 3 (expiry, then the AI review record). */
export async function toArbitration(f: Awaited<ReturnType<typeof activeEscrow>>) {
  await openNegotiation(f);
  await time.increase(NEGOTIATION + 1);
  await f.escrow.connect(f.automation).recordAIReview(f.id, ethers.id("ai-report"), false);
}

export interface RulingInput {
  escrowId: bigint;
  milestoneId: bigint;
  freelancerAmount: bigint;
  clientAmount: bigint;
  rulingHash: string;
  nonce: bigint;
  deadline: bigint;
  resolutionType: number;
}

export async function makeRuling(overrides: Partial<RulingInput> = {}): Promise<RulingInput> {
  const now = BigInt(await time.latest());
  return {
    escrowId: 0n,
    milestoneId: 0n,
    freelancerAmount: ethers.parseEther("0.6"),
    clientAmount: ethers.parseEther("0.4"),
    rulingHash: ethers.id("reasoning"),
    nonce: 1n,
    deadline: now + 10_000n,
    resolutionType: Resolution.HumanArbitration,
    ...overrides,
  };
}

async function domain(escrow: MilestoneEscrow) {
  const { chainId } = await ethers.provider.getNetwork();
  return { name: "MilestoneLock", version: "1", chainId, verifyingContract: await escrow.getAddress() };
}

type Signer = HDNodeWallet | Awaited<ReturnType<typeof ethers.getSigners>>[number];

export async function signRuling(escrow: MilestoneEscrow, by: Signer, r: RulingInput) {
  const types = {
    Ruling: [
      { name: "escrowId", type: "uint256" },
      { name: "milestoneId", type: "uint256" },
      { name: "freelancerAmount", type: "uint256" },
      { name: "clientAmount", type: "uint256" },
      { name: "rulingHash", type: "bytes32" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "resolutionType", type: "uint8" },
    ],
  };
  return by.signTypedData(await domain(escrow), types, r);
}

export async function signAuthorization(escrow: MilestoneEscrow, by: Signer, r: RulingInput) {
  const digest = await escrow.rulingDigest(r);
  const types = { SettlementAuthorization: [{ name: "rulingDigest", type: "bytes32" }] };
  return by.signTypedData(await domain(escrow), types, { rulingDigest: digest });
}
