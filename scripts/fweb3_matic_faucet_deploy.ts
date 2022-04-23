import hre from 'hardhat'
import { writeAddressToFile } from './utils'

const DRIP_AMOUNT = 1
const DECIMAL = 8

const deployMaticFaucet = async (fweb3TokenAddress: string): Promise<string> => {
  try {
    const FaucetContract = await hre.ethers.getContractFactory('Fweb3MaticFaucet')
    const faucet = await FaucetContract.deploy(
      DRIP_AMOUNT,
      DECIMAL,
      fweb3TokenAddress
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
