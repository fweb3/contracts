import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import type { EthFaucet, Fweb3Token } from '../typechain-types'

let fweb3Faucet: EthFaucet,
  fweb3Token: Fweb3Token,
  user1: SignerWithAddress,
  user2: SignerWithAddress,
  owner: SignerWithAddress

beforeEach(async () => {
  ;[owner, user1, user2] = await ethers.getSigners()

  const TokenFactory = await ethers.getContractFactory('Fweb3Token')
  fweb3Token = await TokenFactory.deploy()
  await fweb3Token.deployed()

  const FaucetFactory = await ethers.getContractFactory('EthFaucet')
  fweb3Faucet = await FaucetFactory.deploy(1, 1, false, fweb3Token.address, 100)
  await fweb3Faucet.deployed()
})

describe('Eth faucet', async () => {
  it('should get / set eth balance', async () => {
    await owner.sendTransaction({
      to: fweb3Faucet.address,
      value: ethers.utils.parseEther('666'),
    })
    const balance = await fweb3Faucet.getEthBalance()
    expect(await _weiToEth(balance)).to.equal('666.0')
  })

  it('should only let the owner set eth drip amount', async () => {
    let error: any
    try {
      const user1Faucet = await fweb3Faucet.connect(user1)
      await user1Faucet.setEthDripAmount(ethers.utils.parseEther('666'))
    } catch (e) {
      error = e
    }
    expect(error?.message.includes('Ownable: caller is not the owner')).be.true
  })

  it('should error if drip exceeds balance', async () => {
    let error: any
    try {
      await fweb3Faucet.setEthDripAmount(ethers.utils.parseEther('66666666'))
      await fweb3Faucet.dripEth(owner.address)
    } catch (e) {
      error = e
    }
    expect(error?.message.includes('Insufficient Faucet Funds')).be.true
  })

  it('should need 200 erc20 to drip eth', async () => {
    let error: any
    try {
      await fweb3Faucet.dripEth(user1.address)
    } catch (e) {
      error = e
    }
    expect(error?.message.includes('Not enough')).be.true
  })

  it('should drip eth', async () => {
    await owner.sendTransaction({
      to: fweb3Faucet.address,
      value: ethers.utils.parseEther('666'),
    })
    await fweb3Token.transfer(user1.address, ethers.utils.parseEther('200'))
    await fweb3Faucet.dripEth(user1.address)
    const user1Balance = await user1.getBalance()
    const user1Wei = await _weiToEth(user1Balance)
    expect(user1Wei >= '10000.9').ok
  })

  it('should not drip before timeout', async () => {
    let error: any
    try {
      await owner.sendTransaction({
        to: fweb3Faucet.address,
        value: ethers.utils.parseEther('666'),
      })
      await fweb3Token.transfer(user1.address, ethers.utils.parseEther('200'))
      await fweb3Faucet.dripEth(user1.address)
      await fweb3Faucet.dripEth(user1.address)
    } catch (e) {
      error = e
      
    }
    expect(error?.message.includes('you have already used faucet')).ok
  })

  it('only drips once when single use enabled', async () => {
    let error: any
    try {
      await owner.sendTransaction({
        to: fweb3Faucet.address,
        value: ethers.utils.parseEther('666'),
      })
      await fweb3Token.transfer(user1.address, ethers.utils.parseEther('200'))
      await fweb3Faucet.setSingleUse(true)
      await fweb3Faucet.dripEth(user1.address)
      await fweb3Faucet.dripEth(user1.address)
    } catch (e) {
      error = e
    }
    expect(error?.message.includes('you have already used faucet')).ok
  })

  it('only owner can sign drip for eth', async () => {
    let error: any
    try {
      const user1Faucet = await fweb3Faucet.connect(user1.address)
      await user1Faucet.dripEth(user1.address)
    } catch (e) {
      error = e
    }
    expect(error?.message.includes('VoidSigner cannot sign transactions')).ok
  })

  it('blocks an account from getting drip', async () => {
    let error: any
    try {
      await fweb3Faucet.blockAccount(user1.address)
      await fweb3Faucet.dripEth(user1.address)
    } catch (e) {
      error = e
      
    }
    expect(error?.message.includes('address is blocked')).ok
  })
})

const _weiToEth = async (_in: BigNumber): Promise<string> => {
  const eth = await ethers.utils.formatEther(_in)
  return eth.toString()
}

