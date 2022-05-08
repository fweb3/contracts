import { Fweb3TokenFaucet } from './../typechain-types';
import hre from 'hardhat'
import { writeAddressToFile, copyContractInterface } from './utils'


const FAUCET_CONTRACT_NAME = 'Fweb3TokenFaucet'

const DECIMALS = 18
const DRIP_AMOUNT = 300
const TIMEOUT = 0
const SINGLE_USE = false
const HOLDER_LIMIT = 0

const deployFweb3Faucet = async (
  fweb3TokenAddress: string
): Promise<string> => {
  try {
    const FaucetContractFactory = await hre.ethers.getContractFactory(
      FAUCET_CONTRACT_NAME
    )

    const fweb3TokenFaucetContract: Fweb3TokenFaucet = await FaucetContractFactory.deploy(
      fweb3TokenAddress,
      DRIP_AMOUNT,
      DECIMALS,
      TIMEOUT,
      SINGLE_USE,
      HOLDER_LIMIT
    )

    await fweb3TokenFaucetContract.deployed()
    const faucetAddress: string = fweb3TokenFaucetContract.address
    writeAddressToFile('fweb3_token_faucet', faucetAddress)
    copyContractInterface(FAUCET_CONTRACT_NAME)
    return faucetAddress
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

export { deployFweb3Faucet }
