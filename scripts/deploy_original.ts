import { Contract, ContractFactory } from 'ethers'
import hre from 'hardhat'

import { writeAddressToFile, copyContractInterface } from './utils'

const CONTRACT_NAME = 'Fweb3Diamond'

const deployFweb3DiamondNFT = async (): Promise<string> => {
  try {
    const Fweb3DiamondNFTFactory: ContractFactory =
      await hre.ethers.getContractFactory(CONTRACT_NAME)
    const fweb3DiamondNFT: Contract = await Fweb3DiamondNFTFactory.deploy()
    await fweb3DiamondNFT.deployed()
    const fweb3DiamondNFTAddress = fweb3DiamondNFT.address
    writeAddressToFile('original_fweb3_diamond_nft', fweb3DiamondNFTAddress)
    console.log('original diamond diamond nft address:', fweb3DiamondNFTAddress)
    return fweb3DiamondNFTAddress
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}
deployFweb3DiamondNFT()
export { deployFweb3DiamondNFT }
