import { ethers } from 'ethers'
import dotenv from 'dotenv'
import token from '../artifacts/contracts/Fweb3Token.sol/Fweb3Token.json'
// import adminNft from '../artifacts/contracts/Fweb3AdminNFT.sol/Fweb3AdminNFT.json'

import fs from 'fs-extra'

dotenv.config()

const { LOCAL_ROOT_PRIVK, LOCAL_USER1_PUBKEY, LOCAL_USER2_PUBKEY } = process.env

;(async () => {
  try {
    const erc20TokenAddress = fs.readFileSync(
      'deploy_addresses/local/fweb3_token',
      'utf-8'
    )
    const ethFaucetAddress = fs.readFileSync(
      'deploy_addresses/local/fweb3_eth_faucet',
      'utf-8'
    )
    const erc20FaucetAddress = fs.readFileSync(
      'deploy_addresses/local/fweb3_erc20_faucet',
      'utf-8'
    )
    const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545')
    const ownerWallet = new ethers.Wallet(LOCAL_ROOT_PRIVK || '', provider)
    const contract = new ethers.Contract(
      erc20TokenAddress,
      token.abi,
      ownerWallet
    )

    console.log('sending eth to faucet')
    const sentEthToFaucetTX = await ownerWallet.sendTransaction({
      to: ethFaucetAddress,
      value: ethers.utils.parseEther('10'),
    })
    await sentEthToFaucetTX.wait()

    console.log('sending erc20 to faucet')
    const sendERC20ToFaucet = await contract.transfer(
      erc20FaucetAddress,
      ethers.utils.parseEther('69420')
    )
    await sendERC20ToFaucet.wait()

    console.log('sending erc20 to user1')
    const sentErc20Tx1 = await contract.transfer(
      LOCAL_USER1_PUBKEY,
      ethers.utils.parseEther('666')
    )
    await sentErc20Tx1.wait()

    console.log('sending erc20 to user2')
    const sentErc20Tx2 = await contract.transfer(
      LOCAL_USER2_PUBKEY,
      ethers.utils.parseEther('666')
    )
    await sentErc20Tx2.wait()

    console.log('done')
  } catch (e) {
    console.error(e)
  }
})()
