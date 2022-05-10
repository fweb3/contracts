import { Contract, ContractFactory } from 'ethers'
import hre from 'hardhat'

import { writeAddressToFile, copyContractInterface } from './utils'

// const CONTRACT_NAME = 'Fweb3Diamond'
const CONTRACT_NAME = 'Fweb3Diamond'
const TOKEN_ADDRESS = '0x56a01c1B8C8599Ba5B5A51613BE6704651E8a22e' // MUMBAI
const deployFweb3DiamondNFT = async (): Promise<string> => {
  try {
    // const Fweb3DiamondNFTFactory: ContractFactory =
    //   await hre.ethers.getContractFactory(CONTRACT_NAME)
    // const fweb3DiamondNFT: Contract = await Fweb3DiamondNFTFactory.deploy()
    // await fweb3DiamondNFT.deployed()
    // const fweb3DiamondNFTAddress = fweb3DiamondNFT.address
    // writeAddressToFile('original_fweb3_diamond_nft', fweb3DiamondNFTAddress)
    // console.log('original diamond diamond nft address:', fweb3DiamondNFTAddress)
    // return fweb3DiamondNFTAddress
    const PollFactory = await hre.ethers.getContractFactory('Fweb3Poll')
    const contract = await PollFactory.deploy(TOKEN_ADDRESS)
    await contract.deployed()
    writeAddressToFile('original_fweb3_poll', contract.address)
    console.log('original poll address:', contract.address)
    return contract.address
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}
deployFweb3DiamondNFT()
export { deployFweb3DiamondNFT }
