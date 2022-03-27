import * as dotenv from "dotenv";

import {HardhatUserConfig} from "hardhat/config";

import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "ethereum-waffle";
import "hardhat-gas-reporter";
import "solidity-coverage";

import "./tasks/staking"

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.0",
  networks: {
    rinkeby: {
      url: process.env.RENKEBY_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;