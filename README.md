# MilestoneLock

**Escrow you start with one link in WhatsApp or LinkedIn.**
Clients lock funds into milestones on Ethereum, and ghost-detector timers auto-refund or auto-release when someone goes silent.

Built at **DEV</>NEXUS** by **Team Dark Matter** · Blockchain & Cybersecurity track

> ⚠️ Hackathon MVP. Testnet money only (Hardhat local node / Sepolia). Not audited, not for mainnet.

---

## The problem

Freelancers and clients often agree on work over WhatsApp or LinkedIn. Advance payments are risky for both sides:

- The **client** pays upfront and the freelancer disappears.
- The **freelancer** delivers and the client stops replying.

No one neutral holds the money, so whoever goes silent wins.
*(Source: Razorpay Fix My Itch, B2B Services, Itch Score 76.)*

## The solution

1. The client creates an escrow and **locks the full amount** in a smart contract, split into milestones.
2. The client shares **one invite link** in the chat. The freelancer connects a wallet, sees the money is locked, and accepts.
3. Milestones run **one at a time**. The freelancer submits proof of work (an **IPFS CID stored on-chain**), and the client approves or rejects it.
4. **Timers handle silence**, so nobody has to chase anyone.

The client never risks more than one milestone, and the freelancer can see the money is there before starting.

## Ghost detection

| Situation | What happens |
|---|---|
| 👻 **Freelancer ghosts** (no submission by deadline + grace period) | Anyone can call `claimRefund`, and all unreleased funds go back to the client. |
| 👻 **Client ghosts** (no review by the review deadline) | The keeper runs an **AI proof check** against the acceptance criteria and calls `autoRelease`. Pass → freelancer paid. Fail → dispute. |
| ❌ **Client rejects** | First rejection: one revision with a fresh deadline. Second rejection: dispute. |
| ⚖️ **Dispute** | The arbiter (admin page) decides who gets paid. |

Reminders go out at 50% of each window. The contract only enforces the hard deadlines.

## Escrow lifecycle

```
            createEscrow (funds locked)
                     │
                   Open ──cancel──▶ Cancelled
                     │ accept
                     ▼
     ┌──────────── Active ◀───────────────────────┐
     │               │                            │
     │          submitProof                 next milestone
     │               ▼                            │
     │          Submitted ──approve / AI pass──▶ Released ──(last one)──▶ Completed
     │               │
     │       reject (2nd) / AI fail
     │               ▼
     │           Disputed ──resolveDispute──▶ arbiter decides
     │
     └─ deadline + grace passed, nothing submitted ──claimRefund──▶ Refunded
```

## Tech stack

| Layer | Choice |
|---|---|
| Smart contract | Solidity ^0.8.24, Hardhat (ethers v6, chai), OpenZeppelin `Ownable` + `ReentrancyGuard` |
| Networks | Hardhat local node for dev, **Sepolia** for the demo (Monad testnet optional) |
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, wagmi + viem + RainbowKit |
| Backend | Next.js API routes, Prisma + SQLite (titles, acceptance criteria, AI verdicts) |
| Files | IPFS via Pinata; the CID is the on-chain proof |
| AI proof check | Claude API returning strict JSON `{ pass, confidence, unmet_criteria, reasoning }` |
| Keeper | Script that watches deadlines, sends reminders, and calls `claimRefund` / `autoRelease` |

## Smart contract: `MilestoneEscrow.sol`

One contract holds every escrow. The owner is the arbiter / AI oracle (the backend wallet).

| Function | Who | Purpose |
|---|---|---|
| `createEscrow(freelancer, amounts[], workWindow, reviewWindow)` | client | Lock funds; `freelancer = address(0)` means an open invite |
| `accept(id)` | freelancer | Join and start milestone 0's deadline |
| `submitProof(id, cid)` | freelancer | Submit the IPFS CID before the deadline |
| `approve(id)` / `reject(id, reason)` | client | Review the current milestone |
| `cancel(id)` | client | Cancel before anyone accepts |
| `claimRefund(id)` | anyone | Refund the client if the freelancer ghosted |
| `autoRelease(id, aiPassed)` | owner | Settle after the client ghosted |
| `resolveDispute(id, payFreelancer)` | owner | Arbiter decision |

**Security rules:** every ETH transfer is `nonReentrant` and follows checks-effects-interactions; the contract uses custom errors and emits an event for every state change.

## Project structure

```
MIlesstone/
├── CLAUDE.md          # project guide for AI-assisted development
├── README.md
├── contracts/         # Hardhat project: MilestoneEscrow.sol, tests, deploy + keeper scripts
└── web/               # Next.js app: frontend, API routes, Prisma
```

## Getting started

> The `contracts/` and `web/` folders are being built. These commands will work once they land.

```bash
# Smart contract
cd contracts
npm install
npx hardhat compile
npx hardhat test                                  # includes both ghosting paths
npx hardhat node                                  # local chain
npx hardhat run scripts/deploy.ts --network localhost

# Web app
cd web
npm install
npm run dev
```

### Environment variables

Create `.env` files from `.env.example`. **Never commit `.env`.**

| Variable | Used for |
|---|---|
| `SEPOLIA_RPC_URL`, `DEPLOYER_PRIVATE_KEY`, `ETHERSCAN_API_KEY` | Deploy + verify (testnet-only wallet) |
| `ARBITER_ADDRESS`, `GRACE_PERIOD_SECONDS` | Contract constructor |
| `ANTHROPIC_API_KEY` | AI proof check |
| `PINATA_JWT` | IPFS uploads |

## Roadmap

- [ ] **Phase 1:** `MilestoneEscrow.sol` + tests (ghosting, revision, dispute, access control)
- [ ] **Phase 2:** Local deploy script that exports the ABI and address to the web app
- [ ] **Phase 3:** Frontend: create escrow, invite link, role-aware escrow page, admin page
- [ ] **Phase 4:** Backend: Prisma, Pinata uploads, Claude AI check, keeper
- [ ] **Phase 5:** Sepolia deploy, polish, demo rehearsal

## Demo script

1. Client creates a 3-milestone escrow and locks test ETH. The locked balance is shown.
2. The invite link is shared in WhatsApp; the freelancer connects a wallet and accepts.
3. Freelancer uploads proof. The CID is visible on-chain on Etherscan.
4. Client goes silent → the keeper runs the AI check → milestone auto-released.
5. On the next milestone the freelancer goes silent → remaining funds refunded to the client.

## Out of scope (MVP)

KYC, a real arbiter panel (an admin page is used instead), email/WhatsApp notifications (in-app toasts instead), mainnet.

## Team

**Team Dark Matter** at DEV</>NEXUS.
