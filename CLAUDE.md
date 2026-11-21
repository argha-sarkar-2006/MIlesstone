# MilestoneLock — CLAUDE.md

Hackathon project for **DEV</>NEXUS** (Team **Dark Matter**, Blockchain & Cybersecurity track).
Problem statement: **Freelancer ghosting after advance payments** (source: Razorpay Fix My Itch, B2B Services, Itch Score 76).

This is a hackathon build: the goal is a working, demoable MVP built in a few days, not a production product.
Prefer simple, working code over abstractions. Testnet money only.

## The idea in one paragraph

A client and a freelancer agree on work over WhatsApp or LinkedIn, but no one holds the money, so one of them can ghost.
In MilestoneLock, the client creates an escrow and shares one invite link in the chat. The full amount is locked in a
smart contract and split into milestones that run one at a time. The freelancer submits proof of work (an IPFS CID stored
on-chain), and the client approves or rejects it. Timers handle silence:

- **Freelancer ghosts** (no submission by deadline + grace period) → anyone can call `claimRefund`, and all unreleased funds go back to the client.
- **Client ghosts** (no review by review deadline) → the backend runs an AI proof check against the milestone's acceptance criteria and calls `autoRelease(id, aiPassed)`. Pass → freelancer paid. Fail → dispute → arbiter decides.
- **Client rejects**: the first rejection gives the freelancer one revision with a fresh deadline; a second rejection opens a dispute.

Result: the client never loses more than one milestone, and the freelancer can see the money is locked before starting.

## Tech stack

| Layer | Choice |
|---|---|
| Smart contract | Solidity ^0.8.24, **Hardhat** (toolbox, ethers v6, chai), OpenZeppelin (`Ownable`, `ReentrancyGuard`) |
| Networks | Hardhat local node for development, **Sepolia** for the demo; Monad testnet optional (EVM-compatible, same contract) |
| Frontend | Next.js (App Router) + TypeScript (strict) + Tailwind CSS, **wagmi + viem + RainbowKit** for wallets |
| Backend | Next.js API routes, Prisma + SQLite for off-chain data (titles, acceptance criteria, AI verdicts) |
| Files | IPFS via Pinata; the CID is the on-chain proof |
| AI proof check | Claude API, returns strict JSON `{ pass, confidence, unmet_criteria, reasoning }` |
| Timers / keeper | Script or cron route that checks deadlines, sends 50% reminders, and calls `claimRefund` / `autoRelease` |

Not used (decided against): Razorpay (funds live in the contract now), Polygon, Solana. Hardhat only works on EVM chains.

## Smart contract: `MilestoneEscrow.sol`

One contract holds every escrow. The owner is the arbiter / AI oracle (the backend wallet).

- `createEscrow(freelancer, amounts[], workWindow, reviewWindow)` payable; `msg.value` must equal the sum. `freelancer = address(0)` means an open invite.
- `accept(id)` — freelancer; starts milestone 0's deadline.
- `submitProof(id, cid)` — freelancer, before the deadline.
- `approve(id)` / `reject(id, reason)` — client.
- `cancel(id)` — client, only before anyone accepts.
- `claimRefund(id)` — anyone, after deadline + `gracePeriod`, if nothing was submitted.
- `autoRelease(id, aiPassed)` — owner only, after the review deadline.
- `resolveDispute(id, payFreelancer)` — owner only.
- Views: `escrows(id)`, `getMilestones(id)`, `getMilestone(id, i)`.

Status enums: Escrow `Open, Active, Completed, Refunded, Cancelled`; Milestone `Pending, Submitted, Released, Refunded, Disputed`.

Contract rules:
- Every function that moves ETH is `nonReentrant` and updates state before sending (checks-effects-interactions).
- Use custom errors, not revert strings.
- Emit an event for every state change; the frontend and keeper read events.
- Reminders at 50% of a window happen off-chain; the contract only enforces the hard deadlines.

## Project layout (proposed, confirm with the team before changing)

```
milestonelock/
├── CLAUDE.md
├── contracts/          # Hardhat project
│   ├── contracts/      # MilestoneEscrow.sol
│   ├── test/           # ghosting, revision, dispute, and access-control tests
│   ├── scripts/        # deploy.ts, keeper.ts
│   └── hardhat.config.ts
└── web/                # Next.js app (frontend + API routes + Prisma)
```

## Commands

```bash
cd contracts
npx hardhat compile
npx hardhat test                              # use time helpers (time.increase) to fast-forward deadlines
npx hardhat node                              # local chain
npx hardhat run scripts/deploy.ts --network localhost
npx hardhat run scripts/deploy.ts --network sepolia
```

## Environment variables (never commit `.env`)

- `SEPOLIA_RPC_URL`, `DEPLOYER_PRIVATE_KEY` (testnet-only wallet), `ETHERSCAN_API_KEY`
- `ARBITER_ADDRESS`, `GRACE_PERIOD_SECONDS`
- `ANTHROPIC_API_KEY`, `PINATA_JWT`
- Demo timers: short windows (about 60–120 s) so the full ghosting flow runs live in a few minutes.

## Working agreements

- Ask before creating files or folders outside the agreed layout; the team decides the directory structure.
- Build order: contract + tests → deploy locally → frontend wired to the contract → backend (Prisma, IPFS, AI check, keeper) → polish and demo rehearsal.
- Every contract change needs a passing test, especially both ghosting paths.
- Out of scope for the MVP: KYC, a real arbiter panel (use an admin page), email/WhatsApp notifications (use in-app toasts), mainnet.
- The AI check is for objective work (code, files, specs). If the AI and the client disagree, or the work is subjective, it goes to the arbiter.

## Demo script

1. Client creates a 3-milestone escrow and locks test ETH. Show the locked balance.
2. Share the invite link in a WhatsApp chat; the freelancer connects a wallet and accepts.
3. Freelancer uploads proof. Show the CID on-chain on Etherscan.
4. Client goes silent → the keeper runs the AI check → milestone auto-released to the freelancer.
5. On the next milestone, the freelancer goes silent → refund of the remaining funds to the client.
