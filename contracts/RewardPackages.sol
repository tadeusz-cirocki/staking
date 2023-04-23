// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RewardPackages is Ownable {
    event PackageAdded(uint id, string name);
    event PackageDisabled(uint id);
    event RewardsAdded(uint amount);
    event TokensDeposited(address userAddress, uint packageId, uint amount);
    event TokensWithdrawn(address userAddress, uint packageId);

    // reward package struct; defined by owner
    struct Package {
        string name;
        bool isActive;
        uint lockTime; // lock time in seconds
        uint awardFrequency; // award capitalization frequency (interval) in seconds
        uint rewardPercentage; // 5 == 5%
        uint minDeposit;
        uint maxDeposit;
    }

    // user's stake
    struct Stake {
        uint packageId;
        uint tokenAmount;
        uint lockTimestamp;
    }

    uint private constant rewardPrecision = 9; // it's decimals / 2 == 18 / 2 == 9

    // deposit, reward token
    IERC20 public immutable token;

    // id => package
    // packages can't be deleted (overwritten) from the mapping
    // id increments from 0 with each added package
    mapping(uint => Package) public packages;
    uint public packagesAmount;

    // address, packageId => stake
    mapping(address => mapping(uint => Stake)) public usersStakes;

    constructor(address tokenParam) {
        require(tokenParam != address(0), "Token address can't be empty");
        token = IERC20(tokenParam);
    }

    //todo organize func order

    function createPackage(Package memory package) external onlyOwner {
        packages[packagesAmount] = package;
        emit PackageAdded(packagesAmount, package.name);
        packagesAmount++;
    }

    function getPackageInfo(
        uint id
    ) external view returns (Package memory package) {
        require(id < packagesAmount, "Id too high");
        return packages[id];
    }

    function disablePackage(uint id) external onlyOwner {
        packages[id].isActive = false;
        emit PackageDisabled(id);
    }

    function depositTokens(uint packageId, uint tokenAmount) external {
        Package memory package = packages[packageId];
        require(package.isActive == true, "Package not active");
        require(tokenAmount >= package.minDeposit, "Deposit too small");
        require(tokenAmount <= package.maxDeposit, "Deposit too big");
        // check if adres has no stake in this package already
        require(
            usersStakes[msg.sender][packageId].lockTimestamp == 0,
            "Package already in use by this address"
        );
        // check if enough rewards on the contract for deposit
        Stake memory stake = Stake(packageId, tokenAmount, block.timestamp);
        require(calculateRewards(stake) <= token.balanceOf(address(this)), 'Not enough rewards on contract');

        usersStakes[msg.sender][packageId] = stake;

        token.transferFrom(msg.sender, address(this), tokenAmount);
        
        emit TokensDeposited(msg.sender, packageId, tokenAmount);
    }

    // withdraw deposited + rewards
    function withdrawTokens(uint packageId) external {
        require(packageId < packagesAmount, "Id too high");
        Stake memory stake = usersStakes[msg.sender][packageId];
        // check if address owns this stake
        require(
            stake.lockTimestamp != 0,
            "Package not in use by this address"
        );
        Package memory package = packages[packageId];
        // check if enough time has passed
        require(block.timestamp - stake.lockTimestamp >= package.lockTime, "Stake still locked");
        // delete the stake
        delete usersStakes[msg.sender][packageId];

        // send tokens to user
        uint withdrawAmount = stake.tokenAmount + calculateRewards(stake);
        token.transfer(msg.sender, withdrawAmount);

        emit TokensWithdrawn(msg.sender, packageId);
    }

    function transferTokenForRewards(uint amount) external onlyOwner {
        token.transferFrom(msg.sender, address(this), amount);
        emit RewardsAdded(amount);
    }

    //todo getUserInfo() view

    // calculate rewards for stake
    function calculateRewards(Stake memory stake) public view returns (uint) {
        Package memory package = packages[stake.packageId];

        uint numberOfCapitalizations = package.lockTime /
            package.awardFrequency;
        uint reward = stake.tokenAmount *
            (((package.rewardPercentage + 100) ** numberOfCapitalizations) /
                (100 ** (numberOfCapitalizations - rewardPrecision)));
        return reward / 100 ** rewardPrecision - stake.tokenAmount;
    }
}
