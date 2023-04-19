// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardPackages is Ownable {
    event PackageAdded(string name);

    // reward package struct
    struct Package {
        string name;
        bool isActive;
        uint lockTime; // lock time in seconds
        uint awardFrequency; // award freqency (interval) in seconds
        uint rewardPercentage; // 5 == 5%
        uint minDeposit;
        uint maxDeposit;
    }

    Package[] packages;

    function createPackage(Package memory package) external onlyOwner {
        packages.push(package);
        emit PackageAdded(package.name);
    }
}
