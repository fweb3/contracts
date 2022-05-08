import { ethers } from 'ethers'
import dotenv from 'dotenv'
import token from '../artifacts/contracts/Fweb3Token.sol/Fweb3Token.json'
// import adminNft from '../artifacts/contracts/Fweb3AdminNFT.sol/Fweb3AdminNFT.json'

import fs from 'fs-extra'

dotenv.config()

const {
  LOCAL_OWNER_PRIVK,
  LOCAL_USER1_PUBKEY,
  MUMBAI_ACCOUNT_PRIVK,
  MUMBAI_ALCHEMY_API_KEY,
} = process.env

const ROOT_ADDRESS_DIR = 'deploy_addresses/mumbai'

;(async () => {
  try {
    const fweb3TokenAddress = fs.readFileSync(
      `${ROOT_ADDRESS_DIR}/fweb3_token`,
      'utf-8'
    )
    const maticFaucetAddress = fs.readFileSync(
      `${ROOT_ADDRESS_DIR}/fweb3_matic_faucet`,
      'utf-8'
    )
    const fweb3TokenFaucetAddress = fs.readFileSync(
      `${ROOT_ADDRESS_DIR}/fweb3_token_faucet`,
      'utf-8'
    )
    const provider = new ethers.providers.AlchemyProvider('maticmum', MUMBAI_ALCHEMY_API_KEY)
    const ownerWallet = new ethers.Wallet(MUMBAI_ACCOUNT_PRIVK || '', provider)
    // const ownerWallet = new ethers.Wallet(LOCAL_OWNER_PRIVK || '', provider)
    // const provider = new ethers.providers.JsonRpcProvider(
    //   'http://localhost:8545'
    // )
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
    console.log('sending matic to matic faucet')
    const sendMaticToMaticFaucetTX = await ownerWallet.sendTransaction({
      to: maticFaucetAddress,
      value: ethers.utils.parseEther('1'),
    })
    await sendMaticToMaticFaucetTX.wait()

    console.log('sending matic to fweb3 faucet')
    const sendMaticToFweb3FaucetTX = await ownerWallet.sendTransaction({
      to: fweb3TokenFaucetAddress,
      value: ethers.utils.parseEther('1'),
    })
    await sendMaticToFweb3FaucetTX.wait()

    console.log('sending fweb3 to faucet')
    const fweb3ToFaucetTX = await fweb3TokenContract.transfer(
      fweb3TokenFaucetAddress,
      ethers.utils.parseEther('69420')
    )
    await fweb3ToFaucetTX.wait()

    // console.log('sending fweb3 to user1')
    // const fweb3TransferTX = await fweb3TokenContract.transfer(
    //   LOCAL_USER1_PUBKEY,
    //   ethers.utils.parseEther('300')
    // )
    // await fweb3TransferTX.wait()

    // const fweb3TokenEndBalance = await fweb3TokenContract.balanceOf(
    //   ownerWallet.address
    // )
    // const userTokenEndBalance = await fweb3TokenContract.balanceOf(
    //   LOCAL_USER1_PUBKEY
    // )
    // const ownerEndBalance = await provider.getBalance(ownerWallet.address)
    // const maticEndbalance = await provider.getBalance(maticFaucetAddress)

    // console.log({
    //   fweb3_token_end_balance: fweb3TokenEndBalance.toString(),
    //   owner_matic_end_balance: ownerEndBalance.toString(),
    //   user1_token_end_balance: userTokenEndBalance.toString(),
    //   matic_faucet_end_balance: maticEndbalance.toString(),
    // })
    console.log('done')
  } catch (e) {
    console.error(e)
  }
})()
