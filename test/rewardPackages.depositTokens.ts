import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { calculateStakingRewards, rewardPackage1, toBigNumber } from "./helpers/helpers";
import { deployFixture } from "./helpers/deployFixtures";
import { RewardPackages } from "../typechain-types";
import { ethers } from "hardhat";

describe("Reward Packages", function () {

    describe("deposit tokens", function () {
        it("Should revert if deposit too small", async function () {
            const { reward } = await loadFixture(deployFixture);

            await reward.createPackage(rewardPackage1);

            const packageId = 0;
            const depositAmount = toBigNumber(rewardPackage1.minDeposit).sub(1);

            await expect(reward.depositTokens(packageId, depositAmount)).revertedWith(
                'Deposit too small'
            );
        });

        it("Should revert if deposit too big", async function () {
            const { reward } = await loadFixture(deployFixture);

            await reward.createPackage(rewardPackage1);

            const packageId = 0;
            const depositAmount = toBigNumber(rewardPackage1.maxDeposit).add(1);

            await expect(reward.depositTokens(packageId, depositAmount)).revertedWith(
                'Deposit too big'
            );
        });

        it("Should revert if no rewards on the contract", async function () {
            const { reward } = await loadFixture(deployFixture);

            await reward.createPackage(rewardPackage1);

            const packageId = 0;
            const depositAmount = rewardPackage1.minDeposit;

            await expect(reward.depositTokens(packageId, depositAmount)).revertedWith(
                'Not enough rewards on contract'
            );
        });

        it("Should revert if not enough rewards on the contract", async function () {
            const { reward, token } = await loadFixture(deployFixture);

            await reward.createPackage(rewardPackage1);

            const stake: RewardPackages.StakeStruct = {
                packageId: 0,
                tokenAmount: ethers.utils.parseEther('1'),  // 1 token with 18 decimals
                lockTimestamp: 1000
            }

            const expectedReward = calculateStakingRewards(stake, rewardPackage1);
            await token.approve(reward.address, ethers.constants.MaxUint256);
            // feed the contract but not enough
            await reward.transferTokenForRewards(expectedReward.sub(1));

            const packageId = 0;
            const depositAmount = rewardPackage1.minDeposit;

            await expect(reward.depositTokens(packageId, depositAmount)).revertedWith(
                'Not enough rewards on contract'
            );
        });

        it("Should revert if package already in use by address", async function () {
            const { reward, token, owner } = await loadFixture(deployFixture);

            // owner set up; create package and feed the contract with tokens
            await reward.createPackage(rewardPackage1);
            await token.approve(reward.address, ethers.constants.MaxUint256);
            await reward.transferTokenForRewards((await token.balanceOf(owner.address)).div(2));

            const packageId = 0;
            const depositAmount = rewardPackage1.minDeposit;

            // deposit once
            await reward.depositTokens(packageId, depositAmount);
            // tries to deposit second time
            await expect(reward.depositTokens(packageId, depositAmount)).revertedWith(
                'Package already in use by this address'
            );
        });

        it("Should add to userStakes mapping after successful deposit", async function () {
            const { reward, token, owner } = await loadFixture(deployFixture);

            // owner set up; create package and feed the contract with tokens
            await reward.createPackage(rewardPackage1);
            await token.approve(reward.address, ethers.constants.MaxUint256);
            await reward.transferTokenForRewards((await token.balanceOf(owner.address)).div(2));

            const packageId = 0;
            const depositAmount = rewardPackage1.minDeposit;

            await reward.depositTokens(packageId, depositAmount);

            const stake = await reward.usersStakes(owner.address, packageId);
            expect(stake[0]).equal(packageId);
            expect(stake[1]).equal(depositAmount);
            expect(stake[2]).equal(await time.latest());
        });

        it("Should transfer tokens from user to contract after successful deposit", async function () {
            const { reward, token, owner } = await loadFixture(deployFixture);

            // owner set up; create package and feed the contract with tokens
            await reward.createPackage(rewardPackage1);
            await token.approve(reward.address, ethers.constants.MaxUint256);
            await reward.transferTokenForRewards((await token.balanceOf(owner.address)).div(2));

            const packageId = 0;
            const depositAmount = await rewardPackage1.minDeposit;

            const userBalanceBeforeDeposit = await token.balanceOf(owner.address);
            const contractBalanceBeforeDeposit = await token.balanceOf(reward.address);
            await reward.depositTokens(packageId, depositAmount);

            expect(await token.balanceOf(owner.address)).equal(userBalanceBeforeDeposit.sub(depositAmount));
            expect(await token.balanceOf(reward.address)).equal(contractBalanceBeforeDeposit.add(depositAmount));
        });
    });

});
