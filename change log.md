# MilestoneLock Change Log

Newest entries first. Each entry has a short summary and a JSON record so tools (keeper, frontend, docs) can read it.

## JSON format

Every change is described with this shape:

```json
{
  "version": "0.1.0",
  "date": "YYYY-MM-DD",
  "type": "added | changed | fixed | removed | security | docs",
  "area": "contract | tests | scripts | config | docs | frontend | backend",
  "summary": "One-line description",
  "files": ["web3/contracts/MilestoneEscrow.sol"],
  "breaking": false,
  "status": "done | in-progress | blocked",
  "notes": "Optional context, follow-ups, or tx hashes"
}
```

Field rules:
- `type`: pick one value from the list.
- `area`: the part of the project that changed.
- `files`: paths relative to the repo root.
- `breaking`: `true` if the ABI, events, or storage layout changed.
- `status`: use `blocked` when something waits on a person.

---

## [0.1.0] - 2026-11-24

First working contract, tests, and a live Sepolia run.

```json
{
  "release": "0.1.0",
  "date": "2026-11-24",
  "network": "sepolia",
  "contract": {
    "name": "MilestoneEscrow",
    "address": "0xb68B276D9bCCa40BFb7045Ba520dB2651CC9AD59",
    "deployTx": "0xeae11c08353c81158d4941f604920f9e8a630b2fe45b512a96d0b7a02f74e2f7",
    "explorer": "https://sepolia.etherscan.io/address/0xb68B276D9bCCa40BFb7045Ba520dB2651CC9AD59"
  },
  "changes": [
    {
      "version": "0.1.0",
      "date": "2026-11-24",
      "type": "added",
      "area": "contract",
      "summary": "MilestoneEscrow: milestone escrow with AccessControl roles, pause, pull withdrawals and EIP-712 signed rulings",
      "files": ["web3/contracts/MilestoneEscrow.sol"],
      "breaking": false,
      "status": "done",
      "notes": "Roles: admin, pauser, arbiter, settlement signer, automation, evidence anchor. Only withdraw() sends ETH."
    },
    {
      "version": "0.1.0",
      "date": "2026-11-24",
      "type": "added",
      "area": "contract",
      "summary": "Silence timers: claimRefund (freelancer ghost) and autoRelease (client ghost); one revision before a dispute",
      "files": ["web3/contracts/MilestoneEscrow.sol"],
      "breaking": false,
      "status": "done",
      "notes": "autoRelease(aiPassed=false) opens a dispute straight at Tier 3."
    },
    {
      "version": "0.1.0",
      "date": "2026-11-24",
      "type": "added",
      "area": "contract",
      "summary": "Three-tier dispute resolution: Tier 1 negotiation, Tier 2 AI review record, Tier 3 arbiter ruling plus separate settlement-signer authorization",
      "files": ["web3/contracts/MilestoneEscrow.sol"],
      "breaking": false,
      "status": "in-progress",
      "notes": "Tier 3 resolveDispute always reverts until _validateAllocation is implemented (TODO(human))."
    },
    {
      "version": "0.1.0",
      "date": "2026-11-24",
      "type": "added",
      "area": "contract",
      "summary": "ReentrantReceiver test mock for reentrancy checks",
      "files": ["web3/contracts/mocks/ReentrantReceiver.sol"],
      "breaking": false,
      "status": "done",
      "notes": "Test-only contract; do not deploy."
    },
    {
      "version": "0.1.0",
      "date": "2026-11-24",
      "type": "added",
      "area": "tests",
      "summary": "46 Hardhat tests: lifecycle, ghosting paths, revision, all three dispute tiers, access control, pause, reentrancy, conservation",
      "files": [
        "web3/test/helpers.ts",
        "web3/test/lifecycle.test.ts",
        "web3/test/silence.test.ts",
        "web3/test/disputes.test.ts",
        "web3/test/security.test.ts"
      ],
      "breaking": false,
      "status": "blocked",
      "notes": "36 passing, 10 failing. The 10 are the Tier 3 tests waiting on _validateAllocation."
    },
    {
      "version": "0.1.0",
      "date": "2026-11-24",
      "type": "added",
      "area": "scripts",
      "summary": "deploy.ts for any network and onchain-test.ts that runs three live scenarios and prints every tx hash",
      "files": ["web3/scripts/deploy.ts", "web3/scripts/onchain-test.ts"],
      "breaking": false,
      "status": "done",
      "notes": "Sepolia run passed: autoRelease, claimRefund, and negotiation settlement."
    },
    {
      "version": "0.1.0",
      "date": "2026-11-24",
      "type": "added",
      "area": "config",
      "summary": "Hardhat project setup (Solidity 0.8.24, TypeScript, Sepolia via .env) and .gitignore",
      "files": [
        "web3/hardhat.config.ts",
        "web3/package.json",
        "web3/tsconfig.json",
        "web3/.env.example",
        ".gitignore"
      ],
      "breaking": false,
      "status": "done",
      "notes": "Sepolia network only activates when SEPOLIA_RPC_URL and DEPLOYER_PRIVATE_KEY are set. .env is never committed."
    },
    {
      "version": "0.1.0",
      "date": "2026-11-24",
      "type": "changed",
      "area": "config",
      "summary": "Contract project folder renamed from contracts/ to web3/",
      "files": ["web3/"],
      "breaking": false,
      "status": "done",
      "notes": "CLAUDE.md still refers to the old contracts/ folder and should be updated."
    },
    {
      "version": "0.1.0",
      "date": "2026-11-24",
      "type": "fixed",
      "area": "contract",
      "summary": "Fixed a Solidity stack-too-deep error by moving signature checks and digest building into helper functions",
      "files": ["web3/contracts/MilestoneEscrow.sol"],
      "breaking": false,
      "status": "done",
      "notes": "Ruling has only static fields, so abi.encode(RULING_TYPEHASH, r) matches the EIP-712 struct encoding."
    }
  ]
}
```

### Sepolia transactions (v0.1.0 live test)

| Step | Tx hash |
|---|---|
| Deploy | `0xeae11c08353c81158d4941f604920f9e8a630b2fe45b512a96d0b7a02f74e2f7` |
| Scenario 1 `autoRelease` | `0x3a7570da67ccc44c229b167573e0c5284f9efa84f98f9b216b619dee5233bc52` |
| Scenario 2 `claimRefund` | `0x31a8227ce5c59cf59f2e0cc04af33d6f3e55379835f62a162c5c173750c29d59` |
| Scenario 3 `acceptOffer` | `0xdd1764cdcdb4d3699904bacfba9b4bc0e2401e78c884ecf8505ae8b39e614816` |

### Open items

```json
[
  {
    "item": "Implement _validateAllocation in MilestoneEscrow.sol",
    "owner": "user",
    "blocks": "10 Tier 3 tests and resolveDispute on any network"
  },
  {
    "item": "Update CLAUDE.md layout and commands from contracts/ to web3/",
    "owner": "team",
    "blocks": "nothing"
  },
  {
    "item": "Build the keeper script for autoRelease, claimRefund, and 50% reminders",
    "owner": "team",
    "blocks": "demo steps 4 and 5 running automatically"
  }
]
```
