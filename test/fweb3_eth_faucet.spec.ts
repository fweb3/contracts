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
  fweb3Faucet = await FaucetFactory.deploy(1, 1, false, fweb3Token.address, 100)
  await fweb3Faucet.deployed()
})

describe('Eth faucet', async () => {
  it('should get / set eth balance', async () => {
    await owner.sendTransaction({
      to: fweb3Faucet.address,
      value: ethers.utils.parseEther('666'),
    })
    const balance = await fweb3Faucet.getBalance()
    expect(await _weiToEth(balance)).to.equal('666.0')
  })

  it('should only let the owner set eth drip amount', async () => {
    let error: any
    try {
      const user1Faucet = await fweb3Faucet.connect(user1)
      await user1Faucet.setDripAmount(ethers.utils.parseEther('666'))
    } catch (e) {
      error = e
    }
    expect(error?.message.includes('Ownable: caller is not the owner')).be.true
  })

  it('should error if drip exceeds balance', async () => {
    let error: any
    try {
      await fweb3Faucet.setDripAmount(ethers.utils.parseEther('66666666'))
      await fweb3Faucet.dripEth(owner.address)
    } catch (e) {
      error = e
    }
    expect(error?.message.includes('insufficient funds')).be.true
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
      await fweb3Faucet.setBlockedAccount(user1.address, true)
      await fweb3Faucet.dripEth(user1.address)
    } catch (e) {
      error = e
    }
    await fweb3Faucet.setBlockedAccount(user1.address, false)
    const isBlocked = await fweb3Faucet.getBlockedAccount(user1.address)
    expect(isBlocked).not.ok
    expect(error?.message.includes('blocked')).ok
  })

  it('should not drip when disabled', async () => {
    let error: any
    try {
      await fweb3Faucet.setDisabled(true)
      await fweb3Faucet.dripEth(user1.address)
    } catch (e) {
      error = e
    }
    const isDisabled = await fweb3Faucet.getDisabled()
    expect(isDisabled).ok
    expect(error?.message.includes('disabled')).ok
  })
  it('gets and sets field vars', async () => {
    const before = await fweb3Faucet.getTimeout()
    expect(before).to.equal(1)
    await fweb3Faucet.setTimeout(10)
    const after = await fweb3Faucet.getTimeout()
    expect(after).to.equal(10)

    const singleUse = await fweb3Faucet.getSingleUse()
    expect(singleUse).not.ok

    const dripAmount = await fweb3Faucet.getDripAmount()
    expect(dripAmount).to.equal(ethers.utils.parseEther('1'))

    await fweb3Faucet.setDripAmount(666)
    const dripAmount2 = await fweb3Faucet.getDripAmount()
    expect(dripAmount2).to.equal(666)
  })
})

const _weiToEth = async (_in: BigNumber): Promise<string> => {
  const eth = await ethers.utils.formatEther(_in)
  return eth.toString()
}

