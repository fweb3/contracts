import hre from 'hardhat'
import { writeAddressToFile } from './utils'

const DRIP_AMOUNT = 1
const DECIMAL = 17
const ERC20_MINIMUM = 300
const TIMEOUT = 1440 // min
const SINGLE_USE = true

const deployMaticFaucet = async (fweb3TokenAddress: string): Promise<string> => {
  try {
    const FaucetContract = await hre.ethers.getContractFactory('Fweb3MaticFaucet')
    const faucet = await FaucetContract.deploy(
      DRIP_AMOUNT,
      DECIMAL,
      TIMEOUT,
      SINGLE_USE,
      fweb3TokenAddress,
      ERC20_MINIMUM
    )

    await faucet.deployed()
    const faucetAddress: string = faucet.address
    writeAddressToFile('fweb3_matic_faucet', faucetAddress)
    return faucetAddress
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

export { deployMaticFaucet }
