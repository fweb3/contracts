import { Contract, ContractFactory } from 'ethers'
import hre from 'hardhat'

import { copyContractInterface, writeAddressToFile } from './utils'

const CONTRACT_NAME = 'Fweb3Token'

const deployFweb3Token = async (): Promise<string> => {
  try {
    const Fweb3TokenContract: ContractFactory =
      await hre.ethers.getContractFactory(CONTRACT_NAME)
    const fweb3Token: Contract = await Fweb3TokenContract.deploy()
    await fweb3Token.deployed()
    const fweb3TokenAddress = fweb3Token.address
    writeAddressToFile('fweb3_token', fweb3TokenAddress)
    copyContractInterface(CONTRACT_NAME)
    return fweb3TokenAddress
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

// deployFweb3Token()
//   .then((add) => console.log(add))
//   .catch(console.error)

export { deployFweb3Token }
