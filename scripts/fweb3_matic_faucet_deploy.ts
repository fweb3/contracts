import hre from 'hardhat'
import { writeAddressToFile } from './utils'

const DRIP_AMOUNT = 1
const DECIMAL = 10
const ERC20_MINIMUM = 300
const TIMEOUT = 1 // min
const SINGLE_USE = false

const deployMaticFaucet = async (erc20TokenAddress: string): Promise<string> => {
  try {
    const FaucetContract = await hre.ethers.getContractFactory('Fweb3MaticFaucet')
    const faucet = await FaucetContract.deploy(
      DRIP_AMOUNT,
      DECIMAL,
      TIMEOUT,
      SINGLE_USE,
      erc20TokenAddress,
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
