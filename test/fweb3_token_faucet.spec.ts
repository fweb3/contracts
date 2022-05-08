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
    faucet = await FaucetFactory.deploy(token.address, 100, 18, 0, false, 100)
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
    const tx = await faucet.drip(user1.address)
    const { transactionHash } = await tx.wait()
    expect(transactionHash).ok
  })
  it('wont drip when disabled', async () => {
    let error
    try {
      await faucet.setDisableFaucet(true)
      await faucet.drip(user1.address)
    } catch (err: any) {
      error = err
    }
    expect(error.message.includes('FAUCET_DISABLED'))
  })
  it('wont drip if account has more than limit', async () => {
    let error
    try {
      await token.transfer(user1.address, ethers.utils.parseEther('101'))
      await faucet.drip(user1.address)
    } catch (err: any) {
      error = err
    }
    expect(error.message.includes('FWEB3_WALLET_LIMIT'))
  })
})
