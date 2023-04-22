import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { rewardPackage1, rewardPackage2 } from "./helpers/helpers";
import { deployFixture } from "./helpers/deployFixtures";

describe("Reward Packages", function () {

    describe.only("create package by owner", function () {
        it("Should add packages as expected", async function () {
            const { reward } = await loadFixture(deployFixture);

            // owner adds 2 packages
            await reward.createPackage(rewardPackage1);
            await reward.createPackage(rewardPackage2);

            const package1 = await reward.packages(0);
            const package2 = await reward.packages(1);
            const package3 = await reward.packages(2);  // non existant

            // checking just one property, enough to check if package was added
            expect(package1.name).to.equal(rewardPackage1.name);
            expect(package2.name).to.equal(rewardPackage2.name);
            expect(package3.name).to.equal('');
        });

        it("Should revert if not owner", async function () {
            const { reward, user1 } = await loadFixture(deployFixture);

            await expect(reward.connect(user1).createPackage(rewardPackage1)).revertedWith(
                'Ownable: caller is not the owner'
            );
        });

    });

});
