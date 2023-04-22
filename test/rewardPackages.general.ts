import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { RewardPackages } from "../typechain-types";
import { calculateStakingRewards, rewardPackage1 } from "./helpers/helpers";
import { deployFixture } from "./helpers/deployFixtures";

describe("Reward Packages", function () {
  

  describe("general", function () {
    it("generaal", async function () {
      const { reward } = await loadFixture(deployFixture);

      const stake : RewardPackages.StakeStruct = {
        packageId: 0,
        tokenAmount: ethers.utils.parseEther('1'),  // 1 token with 18 decimals
        lockTimestamp: 1000
      }

      await reward.createPackage(rewardPackage1);
      const log = await reward.calculateRewards(stake);

    });

  });

 
});
