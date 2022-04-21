import hre from 'hardhat'
import { ERC20Faucet } from '../typechain-types'

import { writeAddressToFile } from './utils'

const DRIP_AMOUNT = 300 // eth
const TIMEOUT = 1 // min
const SINGLE_USE = false

const deployERC20Faucet = async (
  erc20TokenAddress: string
): Promise<string> => {
  try {
    const FaucetContract = await hre.ethers.getContractFactory('ERC20Faucet')

    const faucet: ERC20Faucet = await FaucetContract.deploy(
      erc20TokenAddress,
      DRIP_AMOUNT,
      TIMEOUT,
      SINGLE_USE
    )

    await faucet.deployed()
    const faucetAddress: string = faucet.address
    writeAddressToFile('fweb3_erc20_faucet', faucetAddress)
    return faucetAddress
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

export { deployERC20Faucet }
