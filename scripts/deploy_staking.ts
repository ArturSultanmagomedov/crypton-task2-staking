import { ethers} from "hardhat";

require("dotenv").config();

async function main() {
  const Contract = await ethers.getContractFactory("Staking");
  const { LP_TOKEN_ADDRESS, TOKEN_ADDRESS } = process.env;
  if (!LP_TOKEN_ADDRESS || !TOKEN_ADDRESS) {
    throw Error("Set contract addresses");
  }
  const contract = await Contract.deploy(LP_TOKEN_ADDRESS, TOKEN_ADDRESS);

  await contract.deployed();

  console.log("Contract deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
