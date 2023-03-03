import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks:{
    goerli:{
      url: process.env.GOERLI_URL,
      accounts: [process.env.ACCOUNT_1 as string]
    }
  }
};

export default config;