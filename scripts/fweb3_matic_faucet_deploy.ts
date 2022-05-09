import hre from 'hardhat'
import { writeAddressToFile, copyContractInterface } from './utils'

const FAUCET_CONTRACT_NAME = 'Fweb3MaticFaucet'

const DRIP_BASE = 42
const DECIMALS = 15
const TIMEOUT = 0
const SINGLE_USE = false
const MIN_REQUIRED_FWEB3 = 0
const MIN_REQUIRED_FWEB3_DECIMALS = 18
const HOLDER_LIMIT = 0

const deployMaticFaucet = async (
  fweb3TokenAddress: string
): Promise<string> => {
  try {
    const FaucetContract = await hre.ethers.getContractFactory(
      FAUCET_CONTRACT_NAME
    )
    const faucet = await FaucetContract.deploy(
      DRIP_BASE,
      DECIMALS,
      fweb3TokenAddress,
      TIMEOUT,
      SINGLE_USE,
      MIN_REQUIRED_FWEB3,
      MIN_REQUIRED_FWEB3_DECIMALS,
      HOLDER_LIMIT
    )

    await faucet.deployed()
    const faucetAddress: string = faucet.address
    writeAddressToFile('fweb3_matic_faucet', faucetAddress)
    copyContractInterface(FAUCET_CONTRACT_NAME)
    return faucetAddress
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

export { deployMaticFaucet }
