import { ethers } from 'ethers'
import hre from 'hardhat'
import dotenv from 'dotenv'
import token from '../artifacts/contracts/Fweb3Token.sol/Fweb3Token.json'
import fs from 'fs-extra'

dotenv.config()

const { LOCAL_OWNER_PRIVK, MUMBAI_ACCOUNT_PRIVK, MUMBAI_ALCHEMY_API_KEY } =
  process.env

const _getProvider = (network: string) => {
  if (network !== 'localhost') {
    return new ethers.providers.AlchemyProvider(
      'maticmum',
      MUMBAI_ALCHEMY_API_KEY
    )
  } else {
    return new ethers.providers.JsonRpcProvider()
  }
}

type Provider =
  | ethers.providers.JsonRpcProvider
  | ethers.providers.AlchemyProvider

const _getWallet = (network: string, provider: Provider) => {
  if (network !== 'localhost') {
    return new ethers.Wallet(MUMBAI_ACCOUNT_PRIVK || '', provider)
  } else {
    return new ethers.Wallet(LOCAL_OWNER_PRIVK || '', provider)
  }
}

;(async () => {
  try {
    const { name: network } = hre.network
    const ROOT_ADDRESS_DIR = `deploy_addresses/${network}`
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
    const provider = _getProvider(network)
    const ownerWallet = _getWallet(network, provider)

    const fweb3TokenContract = new ethers.Contract(
      fweb3TokenAddress,
      token.abi,
      ownerWallet
    )
    const ownerStartToken = await fweb3TokenContract.balanceOf(ownerWallet.address)
    const start_fweb3 = ethers.utils.formatEther(ownerStartToken.toString())
    const ownerbal = await provider.getBalance(ownerWallet.address)
    const start_eth = ethers.utils.formatEther(ownerbal.toString())
    console.log({ start_fweb3, start_eth })
    console.log(`[+] sending matic to matic faucet on ${network}`)
    const sendMaticToMaticFaucetTX = await ownerWallet.sendTransaction({
      to: maticFaucetAddress,
      value: ethers.utils.parseEther('1'),
    })
    await sendMaticToMaticFaucetTX.wait()

    console.log(`[+] sending matic to fweb3 faucet on ${network}`)
    const sendMaticToFweb3FaucetTX = await ownerWallet.sendTransaction({
      to: fweb3TokenFaucetAddress,
      value: ethers.utils.parseEther('1'),
    })
    await sendMaticToFweb3FaucetTX.wait()

    console.log(`[+] sending fweb3 to faucet on ${network}`)
    const fweb3ToFaucetTX = await fweb3TokenContract.transfer(
      fweb3TokenFaucetAddress,
      ethers.utils.parseEther('69420')
    )
    await fweb3ToFaucetTX.wait()

    const fweb3_faucet_token_balance = await fweb3TokenContract.balanceOf(
      fweb3TokenFaucetAddress
    )
    const fweb3_faucet_matic_balance = await provider.getBalance(
      fweb3TokenFaucetAddress
    )
    const matic_faucet_balance = await provider.getBalance(maticFaucetAddress)

    console.log({
      fweb3_faucet_token_balance: ethers.utils.formatEther(
        fweb3_faucet_token_balance.toString()
      ),
      fweb3_faucet_matic_balance: ethers.utils.formatEther(
        fweb3_faucet_matic_balance.toString()
      ),
      matic_faucet_balance: ethers.utils.formatEther(
        matic_faucet_balance.toString()
      ),
    })
    console.log('done')
  } catch (e) {
    console.error(e)
  }
})()
