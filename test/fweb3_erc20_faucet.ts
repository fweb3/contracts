import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import type { ERC20Faucet, Fweb3Token } from '../typechain-types'

let fweb3Faucet: ERC20Faucet,
  fweb3Token: Fweb3Token,
  user1: SignerWithAddress,
  owner: SignerWithAddress

describe('erc20 faucet', () => {
  beforeEach(async () => {
    ;[owner, user1] = await ethers.getSigners()

    const TokenFactory = await ethers.getContractFactory('Fweb3Token')
    fweb3Token = await TokenFactory.deploy()
    await fweb3Token.deployed()

    const FaucetFactory = await ethers.getContractFactory('ERC20Faucet')
    fweb3Faucet = await FaucetFactory.deploy(fweb3Token.address, ethers.utils.parseEther('0.000001'), 30, false)
    await fweb3Faucet.deployed()

    await fweb3Token.transfer(
      fweb3Faucet.address,
      ethers.utils.parseEther('666')
    )
  })

  it('drips erc20', async () => {
    await fweb3Faucet.dripERC20(user1.address)
    const balance = await fweb3Token.balanceOf(user1.address)
    expect(balance.toString()).to.equal('1000000000000')
  })

  it('wont allow drip if faucet disabled', async () => {
    let error: any
    try {
      await fweb3Faucet.setDisableFaucet(true)
      await fweb3Faucet.dripERC20(user1.address)
    } catch (e) {
      error = e
    }
    expect(error?.message.includes('drip disabled')).ok
  })

  it('wont drip for timeout', async () => {
    let error: any
    try {
      await fweb3Faucet.setTimeout(10)
      await fweb3Faucet.dripERC20(user1.address)
      await fweb3Faucet.dripERC20(user1.address)
    } catch (e) {
      error = e
    }
    expect(error?.message.includes('too early')).ok
  })

  it('wont drip more than once if single use enabled', async () => {
    let error: any
    try {
      await fweb3Faucet.setSingleUse(true)
      await fweb3Faucet.dripERC20(user1.address)
      await fweb3Faucet.dripERC20(user1.address)
    } catch (e) {
      error = e
    }
    expect(error?.message.includes('already used')).ok
  })

  it('drips the set amount', async () => {
    await fweb3Faucet.setDripAmount(2)
    await fweb3Faucet.dripERC20(user1.address)
    const balance = await fweb3Token.balanceOf(user1.address)
    expect(balance).to.equal(2)
  })
})
