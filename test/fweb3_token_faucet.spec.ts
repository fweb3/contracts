import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import hre, { ethers } from 'hardhat'
import type { Fweb3TokenFaucet, Fweb3Token } from '../typechain-types'

let fweb3TokenFaucet: Fweb3TokenFaucet,
  fweb3Token: Fweb3Token,
  user1: SignerWithAddress,
  owner: SignerWithAddress

describe('fweb3 token faucet', () => {
  beforeEach(async () => {
    ;[owner, user1] = await ethers.getSigners()

    const TokenFactory = await ethers.getContractFactory('Fweb3Token')
    fweb3Token = await TokenFactory.deploy()
    await fweb3Token.deployed()

    const FaucetFactory = await ethers.getContractFactory('Fweb3TokenFaucet')
    fweb3TokenFaucet = await FaucetFactory.deploy(
      fweb3Token.address,
      100,
      18,
      30,
      false
    )
    await fweb3TokenFaucet.deployed()
  })

  it('drips fweb3', async () => {
    fweb3Token.transfer(
      fweb3TokenFaucet.address,
      ethers.utils.parseEther('1000000')
    )
    const before = await fweb3Token.balanceOf(user1.address)
    await fweb3TokenFaucet.dripFweb3(user1.address)
    const after = await fweb3Token.balanceOf(user1.address)
    expect(before.toString()).to.equal('0')
    expect(after.toString()).to.equal('100000000000000000000')
  })

  it('errors if dry', async () => {
    let error: any
    try {
      await fweb3TokenFaucet.dripFweb3(user1.address)
    } catch (e) {
      error = e
    }
    expect(error?.message.includes('dry')).ok
  })

  it('wont drip if faucet disabled', async () => {
    let error: any
    fweb3Token.transfer(
      fweb3TokenFaucet.address,
      ethers.utils.parseEther('1000000')
    )
    try {
      await fweb3TokenFaucet.setDisableFaucet(true)
      await fweb3TokenFaucet.dripFweb3(user1.address)
    } catch (e) {
      error = e
    }
    expect(error?.message.includes('disabled')).ok
  })

  it('wont drip for timeout', async () => {
    let error: any
    fweb3Token.transfer(
      fweb3TokenFaucet.address,
      ethers.utils.parseEther('1000000')
    )
    try {
      await fweb3TokenFaucet.setTimeout(10)
      await fweb3TokenFaucet.dripFweb3(user1.address)
      await fweb3TokenFaucet.dripFweb3(user1.address)
    } catch (e) {
      error = e
    }
    expect(error?.message.includes('too soon')).ok
  })

  it('wont drip more than once if single use enabled', async () => {
    let error: any
    fweb3Token.transfer(
      fweb3TokenFaucet.address,
      ethers.utils.parseEther('1000000')
    )
    try {
      await fweb3TokenFaucet.setSingleUse(true)
      await fweb3TokenFaucet.dripFweb3(user1.address)
      await fweb3TokenFaucet.dripFweb3(user1.address)
    } catch (e) {
      error = e
    }
    expect(error?.message.includes('already used')).ok
  })

  it('drips the set amount', async () => {
    fweb3Token.transfer(
      fweb3TokenFaucet.address,
      ethers.utils.parseEther('1000000')
    )
    await fweb3TokenFaucet.setDripAmount(666, 10)
    await fweb3TokenFaucet.dripFweb3(user1.address)
    const balance = await fweb3Token.balanceOf(user1.address)
    expect(balance).to.equal('6660000000000')
  })

  it('can receive eth', async () => {
    const beforeBalance = await fweb3TokenFaucet.provider.getBalance(fweb3TokenFaucet.address)
    const tx = await owner.sendTransaction({
      to: fweb3TokenFaucet.address,
      value: ethers.utils.parseEther('666')
    })
    await tx.wait()
    const afterBalance = await fweb3TokenFaucet.provider.getBalance(
      fweb3TokenFaucet.address
    )
    expect(afterBalance.sub(beforeBalance)).to.equal('666000000000000000000')
  })

  it('should let owner set admin role', async () => {
    const roleBytes = ethers.utils.toUtf8Bytes('ADMIN_ROLE')
    const roleHash = ethers.utils.keccak256(roleBytes)
    await fweb3TokenFaucet.grantRole(roleHash, user1.address)
    const hasRole = fweb3TokenFaucet.hasRole(roleHash, user1.address)
    expect(hasRole).ok
  })

  it('should not drip for a cooldown peroid', async () => {
    let error: any
    fweb3Token.transfer(
      fweb3TokenFaucet.address,
      ethers.utils.parseEther('1000000')
    )
    try {
      await fweb3TokenFaucet.setCooldownEnabled(true)
      await fweb3TokenFaucet.dripFweb3(user1.address)
      await fweb3TokenFaucet.dripFweb3(user1.address)
    } catch (e) {
      error = e
    }
    expect(error?.message.includes('cooldown')).ok
  })
})
