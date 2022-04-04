import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { BigNumber, ContractFactory } from 'ethers'
import { ethers } from 'hardhat'
import type { ERC20Faucet, Fweb3Token } from '../typechain-types'

let fweb3Faucet: ERC20Faucet,
  fweb3Token: Fweb3Token,
  user1: SignerWithAddress,
  user2: SignerWithAddress,
  owner: SignerWithAddress

describe('erc20 faucet', () => {
  beforeEach(async () => {
    ;[owner, user1, user2] = await ethers.getSigners()
  
    const TokenFactory = await ethers.getContractFactory('Fweb3Token')
    fweb3Token = await TokenFactory.deploy()
    await fweb3Token.deployed()
  
    const FaucetFactory = await ethers.getContractFactory('ERC20Faucet')
    fweb3Faucet = await FaucetFactory.deploy(fweb3Token.address, 1, 1, false)
    await fweb3Faucet.deployed()

    await fweb3Token.transfer(fweb3Faucet.address, ethers.utils.parseEther('666'))

  })

  it('drips erc20', async () => {
    await fweb3Faucet.dripERC20(user1.address)
    const balance = await fweb3Token.balanceOf(user1.address)
    expect(balance).to.equal(1)
  })

  it('wont allow drip if faucet disabled', async () => {
    let error: any
    try {
      await fweb3Faucet.setFaucetDisabled(true)
      await fweb3Faucet.dripERC20(user1.address)
    } catch (e) {
      error = e
    }
    const isDisabled = await fweb3Faucet.getFaucetDisabled()
    expect(isDisabled).ok
    expect(error?.message.includes('drip disabled')).ok
  })

  // TODO: figure out timeout
  it.skip('only drips once for account if single use is set', async () => {
    let error: any
    try {
      await fweb3Faucet.setTimeout(0)
      await fweb3Faucet.setSingleUse(true)
      await fweb3Faucet.dripERC20(user1.address)
      await fweb3Faucet.dripERC20(user1.address)
    } catch (e) {
      error = e
      console.log(error.message)
    }
    const hasUsedFaucet = await fweb3Faucet.getHasUsedFaucet(user1.address)
    expect(hasUsedFaucet).ok
    expect(error?.message.includes('already used')).ok
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
    const timeout = await fweb3Faucet.getTimeout()
    expect(timeout).to.equal(10)
    expect(error?.message.includes('too early')).ok
  })

  it('wont let a blocked account drip', async () => {
    let error: any
    try { 
      await fweb3Faucet.setBlockedAccount(user1.address, true)
      await fweb3Faucet.dripERC20(user1.address)
    } catch (e) {
      error = e
    }
    const isBlocked = await fweb3Faucet.getBlockedAccount(user1.address)
    expect(isBlocked).ok
    expect(error?.message.includes('address blocked')).ok
  })

  it('covers getters and setters', async () => {
    const singleUse = await fweb3Faucet.getSingleUse()
    expect(singleUse).not.ok
    const newSingleUse = await fweb3Faucet.setSingleUse(true)
    expect(newSingleUse).ok
    const notUsedFaucet = await fweb3Faucet.getHasUsedFaucet(user1.address)
    expect(notUsedFaucet).not.ok
    await fweb3Faucet.dripERC20(user1.address)
    const hasUsedFaucet = await fweb3Faucet.getHasUsedFaucet(user1.address)
    expect(hasUsedFaucet).ok
  })
})

const _weiToEth = async (_in: BigNumber): Promise<string> => {
  const eth = await ethers.utils.formatEther(_in)
  return eth.toString()
}
