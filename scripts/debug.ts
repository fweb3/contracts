import { ethers } from 'ethers'
import tokenAbi from '../artifacts/contracts/Fweb3Token.sol/Fweb3Token.json'

const OWNER = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
const USER_1 = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
const FWEB3_FAUCET = '0x0B306BF915C4d645ff596e518fAf3F9669b97016'
const FWEB3_TOKEN = '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'

;(async () => {
  try {
    const provider = await new ethers.providers.JsonRpcProvider(
      'http://localhost:8545'
    )

    const contract = await new ethers.Contract(
      FWEB3_TOKEN,
      tokenAbi.abi,
      provider.getSigner()
    )

    const startBalance = await contract.balanceOf(FWEB3_FAUCET)

    // await contract.transfer(USER_1, '666666')
    await contract.transfer(FWEB3_FAUCET, '66666666')
    const endBalance = await contract.balanceOf(
      FWEB3_FAUCET
    )
    const tokenBalance = await contract.balanceOf(OWNER)
    console.log({
      startBalance: startBalance.toString(),
      endBalance: endBalance.toString(),
      tokenBalance: tokenBalance.toString()
    })
  } catch (e) {
    console.error(e)
  }
})()
