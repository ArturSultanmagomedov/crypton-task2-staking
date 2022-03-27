import {task} from "hardhat/config";
import {Staking} from "../typechain";

async function getContract(hre: any, contractAddress: string): Promise<Staking> {
  const Token = await hre.ethers.getContractFactory("Staking");
  return await Token.attach(contractAddress);
}

task("stake", "Stake coins")
  .addParam("contract", "Address of Staking contract")
  .addParam("amount", "Stake amount")
  .setAction(async (taskArgs, hre) => {
    const contract = await getContract(hre, taskArgs.contract);
    await contract.stake(taskArgs.amount);
    console.log(`Success stake ${taskArgs.amount} coins`);
  });

task("unstake", "Unstake coins")
  .addParam("contract", "Address of Staking contract")
  .addParam("amount", "Unstaking amount")
  .setAction(async (taskArgs, hre) => {
    const contract = await getContract(hre, taskArgs.contract);
    await contract.unstake(taskArgs.amount);
    console.log(`Success return ${taskArgs.amount} coins`);
  });

task("claim", "Claim reward tokens")
  .addParam("contract", "Address of Staking contract")
  .setAction(async (taskArgs, hre) => {
    const contract = await getContract(hre, taskArgs.contract);
    await contract.claim();
    console.log(`Success claim coins`);
  });
