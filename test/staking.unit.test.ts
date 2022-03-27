import {expect} from "chai";
import {ethers} from "hardhat";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {parseEther} from "ethers/lib/utils";
import {Staking, Token} from "../typechain";

async function getTimestamp() {
  const blockNumber = await ethers.provider.getBlockNumber();
  const block = await ethers.provider.getBlock(blockNumber);
  return block.timestamp;
}

async function setTimestamp(timestamp: number) {
  await ethers.provider.send("evm_mine", [timestamp]);
}

describe("Staking", async () => {
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let rewardToken: Token;
  let lpToken: Token;
  let staking: Staking;

  let stakeTimeOne: any, stakeTimeTwo: any;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    const Staking = await ethers.getContractFactory("Staking");

    rewardToken = await Token.deploy(parseEther("1000000"));
    await rewardToken.deployed();

    lpToken = await Token.deploy(parseEther("1000000"));
    await lpToken.deployed();

    staking = await Staking.deploy(lpToken.address, rewardToken.address);

    await rewardToken.transfer(staking.address, parseEther("1000000"));
    await lpToken.transfer(user.address, parseEther("1000"));

    await staking.deployed();
  });

  it("transfer LP tokens", async () => {
    await lpToken.approve(staking.address, parseEther("10000"));
    expect(await staking.stake(parseEther("100"))).to
      .changeTokenBalances(lpToken, [owner, staking], [parseEther("-100"), parseEther("100")]);
    expect((await staking.wallets(owner.address)).stakeTime).to.equal(await getTimestamp());
  });

  // it("increase after time", async () => {
  //   const lastUpdateTime = Number(await staking.lastUpdateTime());
  //   await setTimestamp(lastUpdateTime + 60);
  //   expect(await staking.claimable(owner.address)).to.equal(parseEther("6000"));
  // });
  //
  // it("should exclude fee", async () => {
  //   await staking.setFee(1000);
  //   const lastUpdateTime = Number(await staking.lastUpdateTime());
  //   await setTimestamp(lastUpdateTime + 120);
  //   expect(await staking.claimable(owner.address)).to.equal(parseEther("10800"));
  // });

  it("reset rewards", async () => {
    const claimable = ethers.BigNumber.from(await staking.claimable(owner.address)).add(parseEther("90"));
    expect(await staking.claim()).to.changeTokenBalances(rewardToken, [owner], [claimable]);
    expect((await staking.wallets(owner.address)).rewards).to.equal(0);
  });

  // it("should unstake", async () => {
  //   expect(await staking.unstake(parseEther("200"))).to
  //     .changeTokenBalances(lpToken, [owner], [parseEther("200")]);
  // });

  it("should not more than 100% fee", async () => {
    await expect(staking.setFee("100000")).to.revertedWith("Invalid value");
  });

  it("only owner", async () => {
    await staking.setFee("0");
    await expect(staking.connect(user).setFee("0")).to.be.revertedWith("Restricted operation");

    await staking.setLockTime("0");
    await expect(staking.connect(user).setLockTime("0")).to.be.revertedWith("Restricted operation");

    await staking.setClaimPeriod("0");
    await expect(staking.connect(user).setClaimPeriod("0")).to.be.revertedWith("Restricted operation");
  });

  it("rewards according", async () => {
    await lpToken.approve(staking.address, parseEther("500"));
    await lpToken
      .connect(user)
      .approve(staking.address, parseEther("1000"));

    await staking.stake(500);
    stakeTimeOne = await getTimestamp();
    await setTimestamp(await getTimestamp() + 15);

    await staking.connect(user).stake(1000);
    stakeTimeTwo = await getTimestamp();
    await setTimestamp(await getTimestamp() + 15);

    expect(await staking.claimable(owner.address)).to.equal(parseEther("2100"));
    expect(await staking.claimable(user.address)).to.equal(parseEther("1000"));
  });
});
