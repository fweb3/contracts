import { Contract, ContractFactory } from 'ethers'
import hre from 'hardhat'

import { writeAddressToFile } from './utils'

const deployFweb3AdminNFT = async (): Promise<string> => {
  try {
    const Fweb3AdminNFT: ContractFactory =
      await hre.ethers.getContractFactory('Fweb3AdminNFT')
    const adminNFTContract: Contract = await Fweb3AdminNFT.deploy()
    await adminNFTContract.deployed()
    const adminNFTAddress = adminNFTContract.address
    writeAddressToFile('fweb3_admin_nft', adminNFTAddress)
    return adminNFTAddress
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

export { deployFweb3AdminNFT }
