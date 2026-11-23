/**
 * Live end-to-end check on a real network (Sepolia). Uses the configured deployer as the
 * client + automation, and a throwaway freelancer wallet funded with a tiny amount of gas.
 * Prints the contract address and every transaction hash with a block-explorer link.
 *
 *   npx hardhat run scripts/onchain-test.ts --network sepolia
 * Set EXISTING_CONTRACT=0x... to reuse a deployed contract instead of deploying a new one.
 */
import { ethers, network } from "hardhat";
import type { ContractTransactionResponse } from "ethers";

const EXPLORER: Record<string, string> = { sepolia: "https://sepolia.etherscan.io" };
const explorer = EXPLORER[network.name];
const isLocal = network.name === "localhost" || network.name === "hardhat";
const sleep = (s: number) => new Promise((r) => setTimeout(r, s * 1000));

async function step(label: string, p: Promise<ContractTransactionResponse>) {
  const tx = await p;
  await tx.wait();
  console.log(`  ✓ ${label.padEnd(34)} ${explorer ? `${explorer}/tx/` : ""}${tx.hash}`);
}

async function main() {
  const [client] = await ethers.getSigners();
  const bal = await ethers.provider.getBalance(client.address);
  console.log(`Network: ${network.name}   Account: ${client.address}   Balance: ${ethers.formatEther(bal)} ETH`);
  if (!isLocal && bal < ethers.parseEther("0.01")) throw new Error("Need >= 0.01 test ETH. Use a Sepolia faucet.");

  const WORK = 40, REVIEW = 30, GRACE = 30;
  let escrow;
  if (process.env.EXISTING_CONTRACT) {
    escrow = await ethers.getContractAt("MilestoneEscrow", process.env.EXISTING_CONTRACT);
  } else {
    const F = await ethers.getContractFactory("MilestoneEscrow");
    escrow = await F.deploy(client.address, GRACE, 120);
    await escrow.waitForDeployment();
    console.log(`\nContract deployed: ${await escrow.getAddress()}`);
    console.log(`Deploy tx hash:    ${escrow.deploymentTransaction()!.hash}`);
    if (explorer) console.log(`Explorer:          ${explorer}/address/${await escrow.getAddress()}`);
    await step("grant AUTOMATION_ROLE", escrow.grantRole(await escrow.AUTOMATION_ROLE(), client.address));
  }

  const freelancer = ethers.Wallet.createRandom().connect(ethers.provider);
  await (await client.sendTransaction({ to: freelancer.address, value: ethers.parseEther("0.003") })).wait();
  console.log(`\nFreelancer (throwaway): ${freelancer.address}`);

  const A = ethers.parseEther("0.0001");
  const fr = escrow.connect(freelancer);
  // On a real chain wait in real time; on a local node, fast-forward instead.
  const wait = async (s: number) => {
    if (isLocal) { await ethers.provider.send("evm_increaseTime", [s]); await ethers.provider.send("evm_mine", []); }
    else { console.log(`  … waiting ${s}s`); await sleep(s); }
  };

  console.log("\nScenario 1: approve milestone 0, client ghosts milestone 1 -> autoRelease");
  let id = await escrow.escrowCount();
  await step("createEscrow (2 milestones)", escrow.createEscrow(freelancer.address, [A, A], WORK, REVIEW, { value: A * 2n }));
  await step("accept (freelancer)", fr.accept(id));
  await step("submitProof m0", fr.submitProof(id, "bafy-demo-proof-0"));
  await step("approve m0 (client)", escrow.approve(id));
  await step("submitProof m1", fr.submitProof(id, "bafy-demo-proof-1"));
  await wait(REVIEW + 15);
  await step("autoRelease(aiPassed=true)", escrow.autoRelease(id, true));
  await step("withdraw (freelancer)", fr.withdraw());
  if ((await escrow.escrows(id)).status !== 2n) throw new Error("escrow 1 should be Completed");

  console.log("\nScenario 2: freelancer ghosts -> claimRefund");
  id = await escrow.escrowCount();
  await step("createEscrow (2 milestones)", escrow.createEscrow(freelancer.address, [A, A], WORK, REVIEW, { value: A * 2n }));
  await step("accept (freelancer)", fr.accept(id));
  await wait(WORK + GRACE + 15);
  await step("claimRefund (anyone)", escrow.claimRefund(id));
  if ((await escrow.credits(client.address)) < A * 2n) throw new Error("client not credited");
  await step("withdraw (client)", escrow.withdraw());

  console.log("\nScenario 3: two rejections -> Tier 1 dispute -> mutual settlement");
  id = await escrow.escrowCount();
  await step("createEscrow (1 milestone)", escrow.createEscrow(freelancer.address, [A], WORK, REVIEW, { value: A }));
  await step("accept (freelancer)", fr.accept(id));
  await step("submitProof", fr.submitProof(id, "bafy-v1"));
  await step("reject #1 (revision)", escrow.reject(id, "needs changes"));
  await step("submitProof (revision)", fr.submitProof(id, "bafy-v2"));
  await step("reject #2 (opens dispute)", escrow.reject(id, "still wrong"));
  await step("proposeOffer 60% (freelancer)", fr.proposeOffer(id, (A * 6n) / 10n));
  await step("acceptOffer (client)", escrow.acceptOffer(id));
  await step("withdraw (freelancer)", fr.withdraw());
  await step("withdraw (client)", escrow.withdraw());

  const addr = await escrow.getAddress();
  console.log(`\nAll on-chain scenarios passed.\nContract: ${addr}${explorer ? `\n${explorer}/address/${addr}` : ""}`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
