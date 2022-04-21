import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import type { Fweb3MaticFaucet, Fweb3Token } from '../typechain-types'

let maticFaucet: Fweb3MaticFaucet,
  fweb3Token: Fweb3Token,
  user1: SignerWithAddress,
  owner: SignerWithAddress

const DRIP_AMOUNT = 100
const DECIMAL = 18
const MIN_FWEB3 = 300

describe('Matic faucet', () => {
  beforeEach(async () => {
    ;[owner, user1] = await ethers.getSigners()

    const TokenFactory = await ethers.getContractFactory('Fweb3Token')
    fweb3Token = await TokenFactory.deploy()
    await fweb3Token.deployed()

    const MaticFaucetFactory = await ethers.getContractFactory(
      'Fweb3MaticFaucet'
    )
    maticFaucet = await MaticFaucetFactory.deploy(
      DRIP_AMOUNT,
      DECIMAL,
      0,
      false,
      fweb3Token.address,
      MIN_FWEB3
    )
    await maticFaucet.deployed()
  })
  it('should drip matic', async () => {
    await owner.sendTransaction({
      to: maticFaucet.address,
      value: ethers.utils.parseEther('100'),
    })

    await fweb3Token.transfer(user1.address, ethers.utils.parseEther(MIN_FWEB3.toString()))
    const before = await user1.getBalance()
    await maticFaucet.dripMatic(user1.address)
    const after = await user1.getBalance()
    const math = after.sub(before)
    expect(math.toString()).to.equal('100000000000000000000')
  })

  it('should need 200 fweb3 to use matic faucet', async () => {
    let error: any
    try {
      await maticFaucet.dripMatic(user1.address)
    } catch (e) {
      error = e
    }
    expect(error?.message.includes('missing fweb3')).be.true
  })

  it('should not drip when disabled', async () => {
    let error: any
    try {
      await maticFaucet.setDisabled(true)
      await maticFaucet.dripMatic(user1.address)
    } catch (e) {
      error = e
    }
    expect(error?.message.includes('disabled')).ok
  })

  it('should only let owner set drip amount', async () => {
    let error: any
    const before = (await maticFaucet.dripAmount()).toString()
    await maticFaucet.setDripAmount(6, 10)
    const after = (await maticFaucet.dripAmount()).toString()
    expect(before).to.equal((DRIP_AMOUNT * 10 ** DECIMAL).toString())
    expect(after).to.equal('60000000000')
    try {
      const user1Faucet: Fweb3MaticFaucet = await maticFaucet.connect(user1)
      await user1Faucet.setDripAmount(666, 10)
    } catch (e) {
      error = e
    }
    expect(error?.message.includes('Ownable: caller is not the owner')).be.true
  })

  it('should error if drip exceeds balance', async () => {
    let error: any
    await owner.sendTransaction({
      to: maticFaucet.address,
      value: ethers.utils.parseEther('1'),
    })
    try {
      await maticFaucet.setDripAmount(666, 18)
      await maticFaucet.dripMatic(owner.address)
    } catch (e) {
      error = e
    }
    expect(error?.message.includes('insufficient funds')).ok
  })

  it('only drips once when single use enabled', async () => {
    let error: any
    try {
      await owner.sendTransaction({
        to: maticFaucet.address,
        value: ethers.utils.parseEther('666'),
      })
      await fweb3Token.transfer(user1.address, ethers.utils.parseEther('200'))
      await maticFaucet.setSingleUse(true)
      await maticFaucet.dripMatic(user1.address)
      await maticFaucet.dripMatic(user1.address)
    } catch (e) {
      error = e
    }
    expect(error?.message.includes('already used')).ok
  })
  it('should set and not drip for timeout', async () => {
    let error: any
    try {
      await owner.sendTransaction({
        to: maticFaucet.address,
        value: ethers.utils.parseEther('666'),
      })
      await fweb3Token.transfer(user1.address, ethers.utils.parseEther('200'))
      await maticFaucet.setTimeout(10)
      await maticFaucet.dripMatic(user1.address)
      await maticFaucet.dripMatic(user1.address)
    } catch (e) {
      error = e
    }
    expect(error?.message.includes('too soon')).ok
  })
})
