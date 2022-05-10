import hre from 'hardhat'
import { copyContractInterface, writeAddressToFile } from './utils';

const CONTRACT_NAME = 'Fweb3Game'
const TOKEN_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0' // LOCAL
// const TOKEN_ADDRESS = '0x56a01c1B8C8599Ba5B5A51613BE6704651E8a22e' // MUMBAI
const FILE_NAME = 'fweb3_game'

;(async (): Promise<void> => {
  try {
    console.log('RUNNING ORIGINAL CONTRACT DEPLOY')
    const GameFactory = await hre.ethers.getContractFactory(CONTRACT_NAME)
    const contract = await GameFactory.deploy(TOKEN_ADDRESS)
    await contract.deployed()
    writeAddressToFile(FILE_NAME, contract.address)
    console.log('address', contract.address)
    copyContractInterface(CONTRACT_NAME)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()
