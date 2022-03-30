import { Contract, ContractFactory } from 'ethers'
import hre from 'hardhat'

import { writeAddressToFile } from './utils'

const ETH_DRIP_AMOUNT = 1
const ERC20_DRIP_AMOUNT = 10
const ERC20_MIN__TO_USE_ETH_FAUCET = 1
const ETH_TIMEOUT = 3 // min

const deployFweb3Faucet = async (
  erc20TokenAddress: string
): Promise<string> => {
  try {
    const FaucetContract: ContractFactory = await hre.ethers.getContractFactory(
      'Fweb3Faucet'
    )
    const faucet: Contract = await FaucetContract.deploy(
      ETH_DRIP_AMOUNT,
      erc20TokenAddress,
      ERC20_MIN__TO_USE_ETH_FAUCET,
      ERC20_DRIP_AMOUNT,
      ETH_TIMEOUT
    )
    await faucet.deployed()
    const faucetAddress: string = faucet.address
    writeAddressToFile('fweb3_faucet', faucetAddress)
    // console.log('fweb3 token address:', faucetAddress)
    return faucetAddress
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

export { deployFweb3Faucet }
