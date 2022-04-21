import hre from 'hardhat'
import { EthFaucet } from '../typechain-types'
import { ethers } from 'ethers'
import { writeAddressToFile } from './utils'

const DRIP_AMOUNT = 6
const DECIMALS = 10
const ERC20_MINIMUM = 1
const TIMEOUT = 30 // min
const SINGLE_USE = false

const deployEthFaucet = async (erc20TokenAddress: string): Promise<string> => {
  try {
    const FaucetContract = await hre.ethers.getContractFactory('EthFaucet')
    const faucet: EthFaucet = await FaucetContract.deploy(
      DRIP_AMOUNT,
      DECIMALS,
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
