import { Contract, ContractFactory } from 'ethers'
import hre from 'hardhat'

import { writeAddressToFile } from './utils'
const CONTRACT_NAME = 'Fweb3Poll'

const deployFweb3Poll = async (tokenAddress: string): Promise<string> => {
  try {
    const Fweb3PollFactory: ContractFactory =
      await hre.ethers.getContractFactory(CONTRACT_NAME)
    const fweb3Poll: Contract = await Fweb3PollFactory.deploy(tokenAddress)
    await fweb3Poll.deployed()
    const fweb3PollAddress = fweb3Poll.address
    writeAddressToFile('fweb3_poll', fweb3PollAddress)
    return fweb3PollAddress
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

export { deployFweb3Poll }
