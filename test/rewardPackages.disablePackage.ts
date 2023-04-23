import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { rewardPackage1 } from "./helpers/helpers";
import { deployFixture } from "./helpers/deployFixtures";

describe("Reward Packages", function () {

    describe("disable package by owner", function () {
        it("Should disable deposit on package if package disabled", async function () {
            const { reward } = await loadFixture(deployFixture);

            await reward.createPackage(rewardPackage1);

            const packageId = 0;
            await reward.disablePackage(packageId);

            await expect(reward.depositTokens(packageId, 0)).revertedWith(
                'Package not active'
            );
        });

        it("Should revert if not owner", async function () {
            const { reward, user1 } = await loadFixture(deployFixture);

            await expect(reward.connect(user1).disablePackage(0)).revertedWith(
                'Ownable: caller is not the owner'
            );
        });

    });

});
