import hre from 'hardhat'
import { EthFaucet } from '../typechain-types'

import { writeAddressToFile } from './utils'

const DRIP_AMOUNT = 10000000000000 // wei
const ERC20_MINIMUM = 1
const TIMEOUT = 30 // min
const SINGLE_USE = false

const deployEthFaucet = async (
  erc20TokenAddress: string
): Promise<string> => {
  try {
    const FaucetContract = await hre.ethers.getContractFactory(
      'EthFaucet'
    )
    const faucet: EthFaucet = await FaucetContract.deploy(
      DRIP_AMOUNT,
      TIMEOUT,
      SINGLE_USE,
      erc20TokenAddress,
      ERC20_MINIMUM
    )

    await faucet.deployed()
    const faucetAddress: string = faucet.address
    writeAddressToFile('fweb3_eth_faucet', faucetAddress)
    return faucetAddress
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

export { deployEthFaucet }
