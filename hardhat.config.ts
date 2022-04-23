import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'solidity-coverage'
import { HardhatUserConfig } from 'hardhat/types'
import dotenv from 'dotenv'
// import 'hardhat-ethernal'
// import hre from 'hardhat'

dotenv.config()

// extendEnvironment((hre) => {
//   hre.ethernalSync = true
//   hre.ethernalWorkspace = 'Fweb3'
//   hre.ethernalTrace = false
//   hre.ethernalResetOnStart = 'Hardhat'
// })

const {
  MUMBAI_ACCOUNT_PRIVK = '',
  MUMBAI_ALCHEMY_API_KEY = '',
  POLYGON_ALCHEMY_API_KEY = '',
  POLYGON_ACCOUNT_PRIVK = '',
} = process.env

const config: HardhatUserConfig = {
  solidity: '0.8.9',
  networks: {
    localhost: {
      loggingEnabled: true,
      url: 'http://localhost:8545',
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${MUMBAI_ALCHEMY_API_KEY}`,
      accounts: [MUMBAI_ACCOUNT_PRIVK],
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${POLYGON_ALCHEMY_API_KEY}`,
      accounts: [POLYGON_ACCOUNT_PRIVK],
    },
  },
}

export default config
