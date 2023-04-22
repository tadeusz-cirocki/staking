// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// ---
// contract for test purposes; do not deploy;
// ---

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Erc20Token is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        // Mint 10000 tokens to msg.sender
        _mint(msg.sender, 10000 * 10 ** uint(decimals()));
    }
}