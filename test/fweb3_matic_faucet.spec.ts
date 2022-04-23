import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import type { Fweb3MaticFaucet, Fweb3Token } from '../typechain-types'

let faucet: Fweb3MaticFaucet,
  token: Fweb3Token,
  user1: SignerWithAddress,
  user2: SignerWithAddress,
  owner: SignerWithAddress

const DRIP_AMOUNT = 1
const DECIMAL = 8
const MIN_ERC20 = 300
const MIN_ERC20_DECIMALS = 18

describe('Matic faucet', () => {
  beforeEach(async () => {
    ;[owner, user1, user2] = await ethers.getSigners()

    const TokenFactory = await ethers.getContractFactory('Fweb3Token')
    token = await TokenFactory.deploy()
    await token.deployed()

    const MaticFaucetFactory = await ethers.getContractFactory(
      'Fweb3MaticFaucet'
    )
    faucet = await MaticFaucetFactory.deploy(
      DRIP_AMOUNT,
      DECIMAL,
      MIN_ERC20_DECIMALS,
      token.address
    )
    await faucet.deployed()
    await owner.sendTransaction({
      to: faucet.address,
      value: ethers.utils.parseEther('100'),
    })
  })
  it('should drip matic', async () => {
    const wallet = ethers.Wallet.createRandom()
    await token.transfer(
      wallet.address,
      ethers.utils.parseEther(MIN_ERC20.toString())
    )
    await faucet.setAllowablExistingBalance(0)
    await faucet.setTimeout(6)
    await faucet.dripMatic(wallet.address)
    const bal = await faucet.provider.getBalance(wallet.address)
    expect(bal.toString()).to.equal('100000000')
  })
  describe('faucet requirements', async () => {
    it('should not drip when disabled', async () => {
      let error: any
      try {
        await faucet.setDisabled(true)
        await faucet.dripMatic(user1.address)
      } catch (e) {
        error = e
      }
      expect(error?.message.includes('disabled')).ok
    })
    it('should not drip if address has x amount of matic already', async () => {
      let error: any
      try {
        await faucet.dripMatic(user1.address)
      } catch (e) {
        error = e
      }
      expect(error?.message.includes('no need')).ok
    })

    it('needs required erc20 to allow drip', async () => {
      let error: any
      try {
        const wallet = ethers.Wallet.createRandom()
        await faucet.dripMatic(wallet.address)
      } catch (e) {
        error = e
      }
      expect(error?.message.includes('missing erc20')).ok
    })

    it('shouldnt drip twice if single use enabled', async () => {
      let error: any
      try {
        const wallet = ethers.Wallet.createRandom()
        await token.transfer(
          wallet.address,
          ethers.utils.parseEther(MIN_ERC20.toString())
        )
        await faucet.setAllowablExistingBalance(0)
        await faucet.setSingleUse(true)
        await faucet.dripMatic(wallet.address)
        await faucet.dripMatic(wallet.address)
      } catch (e) {
        error = e
      }
      expect(error?.message.includes('used')).ok
    })

    it('shouldnt drip for a timeout', async () => {
      let error: any
      try {
        const wallet = ethers.Wallet.createRandom()
        await token.transfer(
          wallet.address,
          ethers.utils.parseEther(MIN_ERC20.toString())
        )
        await faucet.setAllowablExistingBalance(0)
        await faucet.setTimeout(6)
        await faucet.setSingleUse(false)
        await faucet.dripMatic(wallet.address)
        await faucet.dripMatic(wallet.address)
      } catch (e) {
        error = e
      }
      expect(error?.message.includes('timeout')).ok
    })
  })
  describe('admin functions', async () => {
    it('transferrs eth out', async () => {
      const start = await faucet.provider.getBalance(faucet.address)
      await faucet.drainEth(user1.address)
      const end = await faucet.provider.getBalance(faucet.address)
      expect(start.sub(end)).to.equal(ethers.utils.parseEther('100'))
    })
    it('only lets owner transfer out eth', async () => {
      let error: any
      try {
        const roleBytes = ethers.utils.toUtf8Bytes('ADMIN_ROLE')
        const roleHash = ethers.utils.keccak256(roleBytes)
        await faucet.grantRole(roleHash, user1.address)
        const adminFaucet = await faucet.connect(user1)
        await adminFaucet.drainEth(user1.address)
      } catch (e) {
        error = e
      }
      expect(error?.message.includes('not the owner')).ok
    })
    it('lets admins do admin things', async () => {
      const roleBytes = ethers.utils.toUtf8Bytes('ADMIN_ROLE')
      const roleHash = ethers.utils.keccak256(roleBytes)
      await faucet.grantRole(roleHash, user1.address)
      const adminContract = await faucet.connect(user1)
      await adminContract.setDisabled(true)
      await adminContract.setSingleUse(true)
      await adminContract.setTimeout(666)
      await adminContract.setDripAmount(666, 10)
      await adminContract.setMinErc20Required(666, 10)
      await adminContract.setAllowablExistingBalance(666)
    })
  })
  // it('should let owner set admin role', async () => {
  //   const roleBytes = ethers.utils.toUtf8Bytes('ADMIN_ROLE')
  //   const roleHash = ethers.utils.keccak256(roleBytes)
  //   await maticFaucet.grantRole(roleHash, user1.address)
  //   const hasRole = maticFaucet.hasRole(roleHash, user1.address)
  //   expect(hasRole).ok
  // })
  // it('should only let admin set drip amount', async () => {
  //   let error: any
  //   const before = (await maticFaucet.dripAmount()).toString()
  //   await maticFaucet.setDripAmount(6, 10)
  //   const after = (await maticFaucet.dripAmount()).toString()
  //   expect(before).to.equal((DRIP_AMOUNT * 10 ** DECIMAL).toString())
  //   expect(after).to.equal('60000000000')
  //   try {
  //     const user1Faucet: Fweb3MaticFaucet = await maticFaucet.connect(user1)
  //     await user1Faucet.setDripAmount(666, 10)
  //   } catch (e) {
  //     error = e
  //   }
  //   expect(error?.message.includes('missing role')).be.true
  // })
  // it('should error if drip exceeds balance', async () => {
  //   let error: any
  //   await owner.sendTransaction({
  //     to: maticFaucet.address,
  //     value: ethers.utils.parseEther('1'),
  //   })
  //   try {
  //     await maticFaucet.setDripAmount(666, 18)
  //     await maticFaucet.dripMatic(owner.address)
  //   } catch (e) {
  //     error = e
  //   }
  //   expect(error?.message.includes('dry')).ok
  // })

  // it('only drips once when single use enabled', async () => {
  //   let error: any
  //   try {
  //     await owner.sendTransaction({
  //       to: maticFaucet.address,
  //       value: ethers.utils.parseEther('666'),
  //     })
  //     await fweb3Token.transfer(user1.address, ethers.utils.parseEther('200'))
  //     await maticFaucet.setSingleUse(true)
  //     await maticFaucet.dripMatic(user1.address)
  //     await maticFaucet.dripMatic(user1.address)
  //   } catch (e) {
  //     error = e
  //   }
  //   expect(error?.message.includes('already used')).ok
  // })
  // it('should set and not drip for timeout', async () => {
  //   let error: any
  //   try {
  //     await owner.sendTransaction({
  //       to: maticFaucet.address,
  //       value: ethers.utils.parseEther('666'),
  //     })
  //     await fweb3Token.transfer(user1.address, ethers.utils.parseEther('200'))
  //     await maticFaucet.setTimeout(10)
  //     await maticFaucet.dripMatic(user1.address)
  //     await maticFaucet.dripMatic(user1.address)
  //   } catch (e) {
  //     error = e
  //   }
  //   expect(error?.message.includes('too soon')).ok
  // })

  // it('should not drip for a cooldown peroid', async () => {
  //   let error: any
  //   try {
  //     await owner.sendTransaction({
  //       to: maticFaucet.address,
  //       value: ethers.utils.parseEther('666'),
  //     })
  //     await fweb3Token.transfer(user1.address, ethers.utils.parseEther('200'))
  //     await maticFaucet.setCooldownEnabled(true)
  //     await maticFaucet.dripMatic(user1.address)
  //     await maticFaucet.dripMatic(user1.address)
  //   } catch (e) {
  //     error = e
  //   }
  //   expect(error?.message.includes('cooldown')).ok
  // })
})
