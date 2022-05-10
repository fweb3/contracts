import { Contract, ContractFactory } from 'ethers'
import hre from 'hardhat'

import { writeAddressToFile, copyContractInterface } from './utils'

// const CONTRACT_NAME = 'Fweb3Diamond'
const CONTRACT_NAME = 'Fweb3Trophy'
const TOKEN_ADDRESS = '0x56a01c1B8C8599Ba5B5A51613BE6704651E8a22e' // MUMBAI
const FILE_NAME = 'fweb3_poll'
const deployNewContract = async (): Promise<string> => {
  try {
    console.log('RUNNING NEW CONTRACT DEPLOY')

    const PollFactory = await hre.ethers.getContractFactory(CONTRACT_NAME)
    const contract = await PollFactory.deploy(TOKEN_ADDRESS)
    await contract.deployed()
    writeAddressToFile(FILE_NAME, contract.address)
    console.log('address', contract.address)
    copyContractInterface(CONTRACT_NAME)
    return contract.address
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}
deployNewContract()
export { deployNewContract }
