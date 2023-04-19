// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract RewardPackages {

    // reward package struct
    struct Package {
        string name;
        bool isActive;
        uint lockTime;  // lock time in seconds
        uint awardFrequency; // award freqency (interval) in seconds
        uint rewardPercentage; // 5 == 5%
        uint minDeposit;
        uint maxDeposit;
    }
}
