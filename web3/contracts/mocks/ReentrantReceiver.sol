// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IEscrow {
    function withdraw() external;
    function accept(uint256 id) external;
    function submitProof(uint256 id, string calldata cid) external;
}

/// @dev Test-only: tries to re-enter `withdraw` from its receive hook.
contract ReentrantReceiver {
    IEscrow public immutable escrow;
    uint256 public reentries;
    bool public reentrySucceeded;

    constructor(address escrow_) {
        escrow = IEscrow(escrow_);
    }

    function accept(uint256 id) external {
        escrow.accept(id);
    }

    function submit(uint256 id) external {
        escrow.submitProof(id, "cid");
    }

    function attack() external {
        escrow.withdraw();
    }

    receive() external payable {
        reentries++;
        try escrow.withdraw() {
            reentrySucceeded = true;
        } catch {}
    }
}
