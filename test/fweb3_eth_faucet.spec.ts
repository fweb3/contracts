import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import type { EthFaucet, Fweb3Token } from '../typechain-types'

let fweb3Faucet: EthFaucet,
  fweb3Token: Fweb3Token,
  user1: SignerWithAddress,
  owner: SignerWithAddress

beforeEach(async () => {
  ;[owner, user1] = await ethers.getSigners()

  const TokenFactory = await ethers.getContractFactory('Fweb3Token')
  fweb3Token = await TokenFactory.deploy()
  await fweb3Token.deployed()

  const FaucetFactory = await ethers.getContractFactory('EthFaucet')
  fweb3Faucet = await FaucetFactory.deploy(
    100,
    1,
    false,
    fweb3Token.address,
    100
  )
  await fweb3Faucet.deployed()
})

describe('Eth faucet', () => {
  it('should drip eth', async () => {
    await owner.sendTransaction({
      to: fweb3Faucet.address,
      value: ethers.utils.parseEther('666'),
    })
    await fweb3Token.transfer(user1.address, ethers.utils.parseEther('200'))
    await fweb3Faucet.dripEth(user1.address)
    const balance = await user1.getBalance()
    expect(balance.toString()).to.equal('10100000000000000000000')
  })

  it('should only let the owner set eth drip amount', async () => {
    let error: any
    try {
      const user1Faucet: EthFaucet = await fweb3Faucet.connect(user1)
      await user1Faucet.setDripAmount(666)
    } catch (e) {
      error = e
    }
    expect(error?.message.includes('Ownable: caller is not the owner')).be.true
  })

  it('should error if drip exceeds balance', async () => {
    let error: any
    await owner.sendTransaction({
      to: fweb3Faucet.address,
      value: ethers.utils.parseEther('665'),
    })
    try {
      await fweb3Faucet.setDripAmount(666)
      await fweb3Faucet.dripEth(owner.address)
    } catch (e) {
      error = e
    }
    expect(error?.message.includes('insufficient funds')).ok
  })

  it('should need 200 erc20 to drip eth', async () => {
    let error: any
    try {
      await fweb3Faucet.dripEth(user1.address)
    } catch (e) {
      error = e
    }
    expect(error?.message.includes('missing erc20')).be.true
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
    expect(error?.message.includes('already used')).ok
  })

  it('should not drip when disabled', async () => {
    let error: any
    try {
      await fweb3Faucet.setDisabled(true)
      await fweb3Faucet.dripEth(user1.address)
    } catch (e) {
      error = e
    }
    expect(error?.message.includes('disabled')).ok
  })

  it('should not drip for timeout', async () => {
    let error: any
    try {
      await owner.sendTransaction({
        to: fweb3Faucet.address,
        value: ethers.utils.parseEther('666'),
      })
      await fweb3Token.transfer(user1.address, ethers.utils.parseEther('200'))
      await fweb3Faucet.setTimeout(10)
      await fweb3Faucet.dripEth(user1.address)
      await fweb3Faucet.dripEth(user1.address)
    } catch (e) {
      error = e
      console.log(error.message)
    }
    expect(error?.message.includes('too soon')).ok
  })
})
