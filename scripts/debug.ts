import { ethers } from 'ethers'
import tokenAbi from '../artifacts/contracts/Fweb3Token.sol/Fweb3Token.json'

;(async () => {
  try {
    const provider = await new ethers.providers.JsonRpcProvider(
      'http://localhost:8545'
    )
    // const contract = await ethers.getContractAt(
    //   '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    // )
    const contract = await new ethers.Contract(
      '0x5FbDB2315678afecb367f032d93F642f64180aa3', tokenAbi.abi, provider
    )
    const attached = await contract.attach(
      '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
    )
    const bal = await attached.balanceOf(
      '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc'
    )
    // const bal = await contract.balanceOf(
    //   '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc'
    // )
    console.log(bal.toString())
  } catch (e) {
    console.error(e)
  }
})()
