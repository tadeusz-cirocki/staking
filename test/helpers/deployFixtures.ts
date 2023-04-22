import { ethers } from "hardhat";

export async function deployFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    // sample erc20 token
    const tokenFactory = await ethers.getContractFactory("Erc20Token");
    const token = await tokenFactory.deploy('token', 'TKN');
    const rewardFactory = await ethers.getContractFactory("RewardPackages");
    const reward = await rewardFactory.deploy(token.address);

    return { reward, token, owner, user1, user2 };
}