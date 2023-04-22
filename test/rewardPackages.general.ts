import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { RewardPackages } from "../typechain-types";
import { calculateStakingRewards, rewardPackage1 } from "./helpers/helpers";

describe("Reward Packages", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    // sample erc20 token
    const tokenFactory = await ethers.getContractFactory("Erc20Token");
    const token = await tokenFactory.deploy('token','TKN');
    const rewardFactory = await ethers.getContractFactory("RewardPackages");
    const reward = await rewardFactory.deploy(token.address);

    return { reward, token, owner, otherAccount };
  }

  describe.only("general", function () {
    it("Should set the right unlockTime", async function () {
      const { reward } = await loadFixture(deployFixture);

      const stake : RewardPackages.StakeStruct = {
        packageId: 0,
        tokenAmount: ethers.utils.parseEther('1'),  // 1 token with 18 decimals
        lockTimestamp: 1000
      }

      await reward.createPackage(rewardPackage1);
      const log = await reward.calculateRewards(stake);
      console.log('REWARD: ', log);
      console.log('AAA', await calculateStakingRewards(stake, rewardPackage1));

    });

  });

 
});
