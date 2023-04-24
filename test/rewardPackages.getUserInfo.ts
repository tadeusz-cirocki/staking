import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { calculateStakingRewardForPeriod, dayInSeconds, rewardPackage1 } from "./helpers/helpers";
import { deployFixture } from "./helpers/deployFixtures";
import { ethers } from "hardhat";
import { RewardPackages } from "../typechain-types";

describe("Reward Packages", function () {

    describe("get user info", function () {

        it("Should return correct user info", async function () {
            const { reward, token, owner } = await loadFixture(deployFixture);

            // owner set up; create package and feed the contract with tokens
            await reward.createPackage(rewardPackage1);
            await token.approve(reward.address, ethers.constants.MaxUint256);
            await reward.transferTokenForRewards((await token.balanceOf(owner.address)).div(2));

            const packageId = 0;
            const depositAmount = rewardPackage1.minDeposit;

            await reward.depositTokens(packageId, depositAmount);
            const stake: RewardPackages.StakeStruct = {
                packageId: 0,
                tokenAmount: depositAmount,  // 1 token with 18 decimals
                lockTimestamp: await time.latest()
            }

            await time.increase(dayInSeconds * 10);

            const info = await reward.getUserInfo(owner.address, packageId);
            expect(info[0]).equal(depositAmount);
            expect(info[1]).equal(calculateStakingRewardForPeriod(stake, rewardPackage1, await time.latest() - stake.lockTimestamp));
            expect(info[2]).equal(stake.lockTimestamp + rewardPackage1.lockTime);
        });

    });

});
