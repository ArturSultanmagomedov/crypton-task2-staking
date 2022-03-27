import {ethers} from "hardhat";

async function main() {
  const Token = await ethers.getContractFactory("Token");
  const contract = await Token.deploy(100000);

  await contract.deployed();

  console.log("Deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
