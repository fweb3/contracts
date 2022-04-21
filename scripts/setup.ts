import { ethers } from 'ethers'
import dotenv from 'dotenv'
import token from '../artifacts/contracts/Fweb3Token.sol/Fweb3Token.json'
// import adminNft from '../artifacts/contracts/Fweb3AdminNFT.sol/Fweb3AdminNFT.json'

import fs from 'fs-extra'

dotenv.config()

const { LOCAL_OWNER_PRIVK, LOCAL_USER1_PUBKEY } = process.env

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
    const provider = new ethers.providers.JsonRpcProvider(
      'http://localhost:8545'
    )
    const ownerWallet = new ethers.Wallet(LOCAL_OWNER_PRIVK || '', provider)
    const fweb3TokenContract = new ethers.Contract(
      fweb3TokenAddress,
      token.abi,
      ownerWallet
    )
    const fweb3TokenStartBalance = await fweb3TokenContract.balanceOf(
      ownerWallet.address
    )
    const userTokenStartBalance = await fweb3TokenContract.balanceOf(
      LOCAL_USER1_PUBKEY
    )
    const ownerStartBalance = await provider.getBalance(ownerWallet.address)
    const maticStartbalance = await provider.getBalance(maticFaucetAddress)
    console.log({
      fweb3_token_start_balance: fweb3TokenStartBalance.toString(),
      owner_matic_start_balance: ownerStartBalance.toString(),
      user1_token_start_balance: userTokenStartBalance.toString(),
      matic_faucet_start_balance: maticStartbalance.toString(),
    })
    console.log('sending matic to faucet')
    const sendMaticToFaucetTX = await ownerWallet.sendTransaction({
      to: maticFaucetAddress,
      value: ethers.utils.parseEther('69'),
    })
    await sendMaticToFaucetTX.wait()

    console.log('sending fweb3 to faucet')
    const fweb3ToFaucetTX = await fweb3TokenContract.transfer(
      fweb3TokenFaucetAddress,
      ethers.utils.parseEther('69420')
    )
    await fweb3ToFaucetTX.wait()
    // 9703877935042711017895
    console.log('sending fweb3 to user1')
    const fweb3TransferTX = await fweb3TokenContract.transfer(
      LOCAL_USER1_PUBKEY,
      ethers.utils.parseEther('300')
    )
    await fweb3TransferTX.wait()

    const fweb3TokenEndBalance = await fweb3TokenContract.balanceOf(
      ownerWallet.address
    )
    const userTokenEndBalance = await fweb3TokenContract.balanceOf(
      LOCAL_USER1_PUBKEY
    )
    const ownerEndBalance = await provider.getBalance(ownerWallet.address)
    const maticEndbalance = await provider.getBalance(maticFaucetAddress)

    console.log({
      fweb3_token_end_balance: fweb3TokenEndBalance.toString(),
      owner_matic_end_balance: ownerEndBalance.toString(),
      user1_token_end_balance: userTokenEndBalance.toString(),
      matic_faucet_end_balance: maticEndbalance.toString(),
    })
    console.log('done')
  } catch (e) {
    console.error(e)
  }
})()
