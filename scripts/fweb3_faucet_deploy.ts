import { Fweb3TokenFaucet } from './../typechain-types';
import hre from 'hardhat'
import { writeAddressToFile } from './utils'

const DECIMALS = 18
const DRIP_AMOUNT = 300
const TIMEOUT = 1 // min
const SINGLE_USE = false

const deployFweb3Faucet = async (
  fweb3TokenAddress: string
): Promise<string> => {
  try {
    const FaucetContractFactory = await hre.ethers.getContractFactory('Fweb3TokenFaucet')

    const fweb3TokenFaucetContract: Fweb3TokenFaucet = await FaucetContractFactory.deploy(
      fweb3TokenAddress,
      DRIP_AMOUNT,
      DECIMALS,
      TIMEOUT,
      SINGLE_USE
    )

    await fweb3TokenFaucetContract.deployed()
    const faucetAddress: string = fweb3TokenFaucetContract.address
    writeAddressToFile('fweb3_token_faucet', faucetAddress)
    return faucetAddress
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

export { deployFweb3Faucet }
