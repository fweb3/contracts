import { Contract, ContractFactory } from 'ethers'
import hre from 'hardhat'

import { writeAddressToFile, copyContractInterface } from './utils'

const CONTRACT_NAME = 'Fweb3DiamondNFT'

const deployFweb3DiamondNFT = async (): Promise<string> => {
  try {
    const Fweb3DiamondNFTFactory: ContractFactory =
      await hre.ethers.getContractFactory(CONTRACT_NAME)
    const fweb3DiamondNFT: Contract = await Fweb3DiamondNFTFactory.deploy()
    await fweb3DiamondNFT.deployed()
    const fweb3DiamondNFTAddress = fweb3DiamondNFT.address
    writeAddressToFile('fweb3_diamond_nft', fweb3DiamondNFTAddress)
    copyContractInterface(CONTRACT_NAME)
    return fweb3DiamondNFTAddress
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}
deployFweb3DiamondNFT()
export { deployFweb3DiamondNFT }
