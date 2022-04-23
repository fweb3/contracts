import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import type { Fweb3TokenFaucet, Fweb3Token } from '../typechain-types'

let faucet: Fweb3TokenFaucet,
  token: Fweb3Token,
  user1: SignerWithAddress,
  user2: SignerWithAddress,
  owner: SignerWithAddress

const STARTING_FAUCET_BALANCE = '1000000'

describe('fweb3 token faucet', () => {
  beforeEach(async () => {
    ;[owner, user1, user2] = await ethers.getSigners()

    const TokenFactory = await ethers.getContractFactory('Fweb3Token')
    token = await TokenFactory.deploy()
    await token.deployed()

    const FaucetFactory = await ethers.getContractFactory('Fweb3TokenFaucet')
    faucet = await FaucetFactory.deploy(token.address, 100, 18)
    await faucet.deployed()

    await owner.sendTransaction({
      to: faucet.address,
      value: ethers.utils.parseEther('666'),
    })

    await token.transfer(
      faucet.address,
      ethers.utils.parseEther(STARTING_FAUCET_BALANCE)
    )
  })
  it('drips fweb3', async () => {
    const before = await token.balanceOf(user1.address)
    await faucet.dripFweb3(user1.address)
    const after = await token.balanceOf(user1.address)
    expect(before.toString()).to.equal('0')
    expect(after.toString()).to.equal('100000000000000000000')
  })

  it('drips the set amount', async () => {
    token.transfer(faucet.address, ethers.utils.parseEther('1000000'))
    await faucet.setDripAmount(666, 10)
    await faucet.dripFweb3(user1.address)
    const balance = await token.balanceOf(user1.address)
    expect(balance).to.equal('6660000000000')
  })

  it('should let owner set admin role', async () => {
    const roleBytes = ethers.utils.toUtf8Bytes('ADMIN_ROLE')
    const roleHash = ethers.utils.keccak256(roleBytes)
    await faucet.grantRole(roleHash, user1.address)
    const hasRole = faucet.hasRole(roleHash, user1.address)
    expect(hasRole).ok
  })
  it('allows admins to do admin things', async () => {
    const roleBytes = ethers.utils.toUtf8Bytes('ADMIN_ROLE')
    const roleHash = ethers.utils.keccak256(roleBytes)
    await faucet.grantRole(roleHash, user1.address)
    const user1Contract = await faucet.connect(user1)
    await user1Contract.setDisableFaucet(true)
    await user1Contract.setSingleUse(true)
    await user1Contract.setTimeout(666)
    await user1Contract.setHolderLimit(666)
    await user1Contract.clearTimeout(user2.address)
    expect(true).ok
  })

  it('throws a dry error when out of tokens', async () => {
      let error: any
      try {
        await faucet.drainErc20(user1.address)
        await faucet.dripFweb3(user1.address)
      } catch (e) {
        error = e
      }
      expect(error?.message.includes('dry')).ok
  })
  describe('transfers', () => {    it('can receive eth', async () => {
      const beforeBalance = await faucet.provider.getBalance(faucet.address)
      const tx = await owner.sendTransaction({
        to: faucet.address,
        value: ethers.utils.parseEther('666'),
      })
      await tx.wait()
      const afterBalance = await faucet.provider.getBalance(faucet.address)
      expect(afterBalance.sub(beforeBalance)).to.equal('666000000000000000000')
    })
    it('transferrs eth out', async () => {
      const start = await faucet.provider.getBalance(faucet.address)
      await faucet.drainEth(user1.address)
      const end = await faucet.provider.getBalance(faucet.address)
      expect(start.sub(end)).to.equal(ethers.utils.parseEther('666'))
    })

    it('transfers out token', async () => {
      const start = await token.balanceOf(faucet.address)
      await faucet.drainErc20(user1.address)
      const end = await token.balanceOf(faucet.address)
      expect(start.eq(ethers.utils.parseEther(STARTING_FAUCET_BALANCE)))
      expect(end.eq(0))
    })
  })

  describe('faucet rules', () => {
    it('wont drip if faucet disabled', async () => {
      let error: any
      try {
        await faucet.setDisableFaucet(true)
        await faucet.dripFweb3(user1.address)
      } catch (e) {
        error = e
      }
      expect(error?.message.includes('disabled')).ok
    })

    it('wont drip if account has more than the limit of tokens', async () => {
      let error: any
      try {
        await token.transfer(user1.address, ethers.utils.parseEther('301'))
        await faucet.dripFweb3(user1.address)
      } catch (e: any) {
        error = e
      }
      expect(error?.message.includes('limit')).ok
    })

    it('wont drip twice if single use is enabled', async () => {
      let error: any
      try {
        await faucet.setSingleUse(true)
        await faucet.dripFweb3(user1.address)
        await faucet.dripFweb3(user1.address)
      } catch (e: any) {
        error = e
      }
      expect(error?.message.includes('used')).ok
    })
    it('wont drip for timeout', async () => {
      let error: any
      try {
        await faucet.setSingleUse(false)
        await faucet.setTimeout(10)
        await faucet.dripFweb3(user1.address)
        await faucet.dripFweb3(user1.address)
      } catch (e: any) {
        error = e
      }
      expect(error?.message.includes('timeout')).ok
    })
  })
})
