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
const DECIMAL = 16
const TIMEOUT = 0
const SINGLE_USE = false
const MIN_FWEB3_REQUIRED = 300
const MIN_FWEB3_DECIMALS = 18
const HOLDER_MATIC_LIMIT = 0

const ADMIN_ROLE_HASH =
  '0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775'

const pauseFor = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('Matic faucet', () => {
  beforeEach(async () => {
    ;[owner, user1, user2] = await ethers.getSigners()

    const Fweb3Token = await ethers.getContractFactory('Fweb3Token')
    token = await Fweb3Token.deploy()
    await token.deployed()

    const MaticFaucetFactory = await ethers.getContractFactory(
      'Fweb3MaticFaucet'
    )

    faucet = await MaticFaucetFactory.deploy(
      DRIP_AMOUNT,
      DECIMAL,
      token.address,
      TIMEOUT,
      SINGLE_USE,
      MIN_FWEB3_REQUIRED,
      MIN_FWEB3_DECIMALS,
      HOLDER_MATIC_LIMIT
    )
    await faucet.deployed()
    await owner.sendTransaction({
      to: faucet.address,
      value: ethers.utils.parseEther('100'),
    })
    await token.transfer(user1.address, ethers.utils.parseEther('300'))
  })
  it('should drip matic', async () => {
    const tx = await faucet.drip(user1.address)
    const receipt = await tx.wait()
    expect(receipt.transactionHash).ok
  })
  it('should not drip without min required fweb3 tokens', async () => {
    let error
    try {
      await faucet.drip(user2.address)
    } catch (err: any) {
      error = err
    }
    expect(error?.message.includes('MISSING_FWEB3_TOKENS'))
  })

  it('should not drip when disabled', async () => {
    let error
    try {
      await faucet.setDisableFaucet(true)
      await faucet.drip(user1.address)
    } catch (err: any) {
      error = err
    }
    expect(error?.message.includes('FAUCET_DISABLED'))
  })

  it('should only let admins call the drip', async () => {
    await faucet.grantRole(ADMIN_ROLE_HASH, user1.address)
    const user1Faucet = await faucet.connect(user1)
    const tx = await user1Faucet.drip(user1.address)
    const receipt = await tx.wait()
    expect(receipt.transactionHash).ok
    let error
    try {
      const user2Faucet = faucet.connect(user2)
      await user2Faucet.drip(user2.address)
    } catch (err: any) {
      error = err
    }
    expect(error?.message.includes(`is missing role ${ADMIN_ROLE_HASH}`))
  })

  it('should only drip once with single use enabled', async () => {
    let error
    try {
      await faucet.drip(user1.address)
      await faucet.drip(user1.address)
    } catch (err: any) {
      error = err
    }
    expect(error?.message.includes('SINGLE_USE'))
  })

  it('should not drip for a timeout', async () => {
    let error
    await faucet.setTimeout(0)
    await faucet.drip(user1.address)
    const tx = await faucet.drip(user1.address)
    const { transactionHash } = await tx.wait()
    expect(transactionHash).ok
    try {
      await faucet.setTimeout(2)
      await faucet.drip(user1.address)
      await pauseFor(1000)
      await faucet.drip(user1.address)
    } catch (err: any) {
      error = err
    }
    expect(error?.message.includes('WALLET_TIMEOUT'))
  })
})
