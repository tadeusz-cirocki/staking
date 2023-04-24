import { ethers } from "hardhat";
import { RewardPackages } from "../../typechain-types";
import { PromiseOrValue } from "../../typechain-types/common";

// calculate staking reward locally (whole period)
export function calculateStakingReward(stake: RewardPackages.StakeStruct, rewardPackage: RewardPackages.PackageStruct) {
        return calculateStakingRewardForPeriod(stake, rewardPackage, (toBigNumber(rewardPackage.lockTime)).toNumber());
}

// e.g. get rewards for 2 weeks of staking
export function calculateStakingRewardForPeriod(stake: RewardPackages.StakeStruct, rewardPackage: RewardPackages.PackageStruct, periodInSeconds: number) {
    const numberOfCapitalizations = ethers.BigNumber.from(periodInSeconds)
        .div(ethers.BigNumber.from(rewardPackage.awardFrequency));
    const reward = ethers.BigNumber.from(stake.tokenAmount)
        .mul(ethers.BigNumber.from(rewardPackage.rewardPercentage).add(100).pow(numberOfCapitalizations))
        .div(ethers.BigNumber.from(100).pow(numberOfCapitalizations))
    return reward.sub(ethers.BigNumber.from(stake.tokenAmount));
}

export function toBigNumber(num: PromiseOrValue<BigNumberish>) {
    return ethers.BigNumber.from(num);
}

//
// consts
//

export const dayInSeconds = 60 * 60 * 24;

export const rewardPackage1: RewardPackages.PackageStruct = {
    name: 'package1',
    isActive: true,
    lockTime: 30 * dayInSeconds,  // lock for 30 days
    awardFrequency: dayInSeconds, // capitalization daily
    rewardPercentage: 1,
    minDeposit: ethers.utils.parseEther('1'),
    maxDeposit: ethers.utils.parseEther('100')
}

export const rewardPackage2: RewardPackages.PackageStruct = {
    name: 'package2',
    isActive: true,
    lockTime: 360 * dayInSeconds,  // lock for 360 days
    awardFrequency: 10 * dayInSeconds, // capitalization every 10 days
    rewardPercentage: 2,
    minDeposit: ethers.utils.parseEther('1'),
    maxDeposit: ethers.utils.parseEther('100')
}