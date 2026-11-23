import { ethers, network } from "hardhat";
import * as fs from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();
  const grace = Number(process.env.GRACE_PERIOD_SECONDS ?? 60);
  const negotiation = Number(process.env.NEGOTIATION_WINDOW_SECONDS ?? 120);

  const Factory = await ethers.getContractFactory("MilestoneEscrow");
  const escrow = await Factory.deploy(deployer.address, grace, negotiation);
  const tx = escrow.deploymentTransaction()!;
  await escrow.waitForDeployment();
  const address = await escrow.getAddress();

  const grants: [string, string | undefined][] = [
    ["ARBITER_ROLE", process.env.ARBITER_ADDRESS],
    ["SETTLEMENT_SIGNER_ROLE", process.env.SETTLEMENT_SIGNER_ADDRESS],
    ["AUTOMATION_ROLE", process.env.AUTOMATION_ADDRESS ?? deployer.address],
  ];
  for (const [role, who] of grants) {
    if (who) await (await escrow.grantRole(await (escrow as any)[role](), who)).wait();
  }

  console.log(`Network:          ${network.name}`);
  console.log(`Contract address: ${address}`);
  console.log(`Deploy tx hash:   ${tx.hash}`);
  fs.mkdirSync("deployments", { recursive: true });
  fs.writeFileSync(`deployments/${network.name}.json`, JSON.stringify({ address, deployTx: tx.hash, grace, negotiation }, null, 2));
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
