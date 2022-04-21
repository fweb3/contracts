import { ethers } from 'ethers'
import dotenv from 'dotenv'
import token from '../artifacts/contracts/Fweb3Token.sol/Fweb3Token.json'
// import adminNft from '../artifacts/contracts/Fweb3AdminNFT.sol/Fweb3AdminNFT.json'

import fs from 'fs-extra'

dotenv.config()

const { LOCAL_ROOT_PRIVK, LOCAL_USER1_PUBKEY, LOCAL_USER2_PUBKEY } = process.env

;(async () => {
  try {
    const fweb3TokenAddress = fs.readFileSync(
      'deploy_addresses/local/fweb3_token',
      'utf-8'
    )
    const maticFaucetAddress = fs.readFileSync(
      'deploy_addresses/local/fweb3_matic_faucet',
      'utf-8'
    )
    const fweb3TokenFaucetAddress = fs.readFileSync(
      'deploy_addresses/local/fweb3_token_faucet',
      'utf-8'
    )
    const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545')
    const ownerWallet = new ethers.Wallet(LOCAL_ROOT_PRIVK || '', provider)
    const contract = new ethers.Contract(
      fweb3TokenAddress,
      token.abi,
      ownerWallet
    )

    console.log('sending matic to faucet')
    const sendMaticToFaucetTX = await ownerWallet.sendTransaction({
      to: maticFaucetAddress,
      value: ethers.utils.parseEther('69'),
    })
    await sendMaticToFaucetTX.wait()

    console.log('sending fweb3 to faucet')
    const fweb3ToFaucetTX = await contract.transfer(
      fweb3TokenFaucetAddress,
      ethers.utils.parseEther('69420')
    )
    await fweb3ToFaucetTX.wait()

    console.log('sending fweb3 to user1')
    const fweb3TransferTX = await contract.transfer(
      LOCAL_USER1_PUBKEY,
      ethers.utils.parseEther('300')
    )
    await fweb3TransferTX.wait()

    console.log('done')
  } catch (e) {
    console.error(e)
  }
})()
