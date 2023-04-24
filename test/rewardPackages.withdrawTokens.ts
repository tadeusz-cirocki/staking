import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { calculateStakingReward, rewardPackage1, toBigNumber } from "./helpers/helpers";
import { deployFixture } from "./helpers/deployFixtures";
import { ethers } from "hardhat";

describe("Reward Packages", function () {

    describe("withdraw tokens", function () {
        it("Should revert if provided with id of nonexistant package", async function () {
            const { reward } = await loadFixture(deployFixture);

            const packageId = 0;

            await expect(reward.withdrawTokens(packageId)).revertedWith(
                'Id too high'
            );
        });

        it("Should revert if address does not own this stake", async function () {
            const { reward } = await loadFixture(deployFixture);

            await reward.createPackage(rewardPackage1);

            const packageId = 0;

            await expect(reward.withdrawTokens(packageId)).revertedWith(
                'Package not in use by this address'
            );
        });

        it("Should revert if stake still locked", async function () {
            const { reward, token, owner } = await loadFixture(deployFixture);

            await reward.createPackage(rewardPackage1);
            await token.approve(reward.address, ethers.constants.MaxUint256);
            await reward.transferTokenForRewards((await token.balanceOf(owner.address)).div(2));

            const packageId = 0;
            const depositAmount = toBigNumber(rewardPackage1.minDeposit);

            await reward.depositTokens(packageId, depositAmount);

            await expect(reward.withdrawTokens(packageId)).revertedWith(
                'Stake still locked'
            );
        });

        it("Should delete the stake upon successful withdraw", async function () {
            const { reward, token, owner } = await loadFixture(deployFixture);

            // owner set up
            await reward.createPackage(rewardPackage1);
            await token.approve(reward.address, ethers.constants.MaxUint256);
            await reward.transferTokenForRewards((await token.balanceOf(owner.address)).div(2));

            // deposit
            const packageId = 0;
            const depositAmount = toBigNumber(rewardPackage1.minDeposit);
            await reward.depositTokens(packageId, depositAmount);

            // skip the time so stack unlocks
            const currentTimestamp = await time.latest();
            await time.increaseTo(toBigNumber(rewardPackage1.lockTime).add(currentTimestamp));

            // withdraw
            await reward.withdrawTokens(packageId);

            const stake = await reward.usersStakes(owner.address, packageId);
            expect(stake[0]).equal(0);
            expect(stake[1]).equal(0);
            expect(stake[2]).equal(0);
        });

        it("Should transfer tokens (deposit + rewards) from contract to user upon successful withdraw", async function () {
            const { reward, token, owner } = await loadFixture(deployFixture);

            // owner set up
            await reward.createPackage(rewardPackage1);
            await token.approve(reward.address, ethers.constants.MaxUint256);
            await reward.transferTokenForRewards((await token.balanceOf(owner.address)).div(2));

            // deposit
            const packageId = 0;
            const depositAmount = toBigNumber(rewardPackage1.minDeposit);
            await reward.depositTokens(packageId, depositAmount);

            // skip the time so stack unlocks
            const currentTimestamp = await time.latest();
            await time.increaseTo(toBigNumber(rewardPackage1.lockTime).add(currentTimestamp));

            const rewardAmount =
                calculateStakingReward(await reward.usersStakes(owner.address, packageId), rewardPackage1);

            const userBalanceBeforeWithdraw = await token.balanceOf(owner.address);
            const contractBalanceBeforeWithdraw = await token.balanceOf(reward.address);
            // withdraw
            await reward.withdrawTokens(packageId);

            expect(await token.balanceOf(owner.address)).equal(userBalanceBeforeWithdraw.add(depositAmount).add(rewardAmount));
            expect(await token.balanceOf(reward.address)).equal(contractBalanceBeforeWithdraw.sub(depositAmount).sub(rewardAmount));
        });

    });

});
