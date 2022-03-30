import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { BigNumber, Contract } from 'ethers'
import { ethers } from 'hardhat'

let fweb3Faucet: Contract,
  fweb3Token: Contract,
  owner: SignerWithAddress,
  user1: SignerWithAddress

describe('Fweb3 Faucet Contract', () => {
  beforeEach(async () => {
    ;[owner, user1] = await ethers.getSigners()

    const TokenFactory = await ethers.getContractFactory('Fweb3Token')
    fweb3Token = await TokenFactory.deploy()
    await fweb3Token.deployed()
    
    const FaucetFactory = await ethers.getContractFactory('Fweb3TokenFaucet')
    fweb3Faucet = await FaucetFactory.deploy(2, fweb3Token.address, 200, 1, 3)
    await fweb3Faucet.deployed()

    await owner.sendTransaction({ 
      to: fweb3Faucet.address, 
      value: ethers.utils.parseEther('666') 
    })
  })

  describe('eth drip', () => {
    it('should get eth balance', async () => {
      const balance = await fweb3Faucet.getEthBalance()
      expect(await _weiToEth(balance)).to.equal('666.0')
    })

    it('should only let the owner get/set eth drip amount', async () =>{
      await fweb3Faucet.setEthDripAmount(ethers.utils.parseEther('666'))
      const dripAmount = await fweb3Faucet.getEthDripAmount()
      expect(await _weiToEth(dripAmount)).to.equal('666.0')
      
      let error: any
      try {
        const user1Faucet = await fweb3Faucet.connect(user1)
        await user1Faucet.getEthDripAmount()
      } catch (e) {
        error = e
      }
      expect(error?.message.includes('unauthorized')).be.true
    })

    it('should error if drip exceeds balance', async () => {
      let error: any
      try {
        await fweb3Faucet.setEthDripAmount(ethers.utils.parseEther('66666666'))
        await fweb3Faucet.dripEth(owner.address)
      } catch (e) {
        error = e
      }
      expect(error?.message.includes('Insufficient Faucet Funds')).be.true
    })

    it.skip('should not let a drip for a timeout', async () => {
      // TODO: figure me out
    })
    
    it('should need 200 erc20 to drip eth', async () => {
      let error: any;
      try {
        await fweb3Faucet.dripEth(user1.address)
      } catch (e) {
        error = e
      }
      expect(error?.message?.includes('Not enough')).be.true
    })

    it('should drip eth', async () => {
      await fweb3Token.transfer(user1.address, ethers.utils.parseEther('200'))
      await fweb3Faucet.dripEth(user1.address)
      const balance = await user1.getBalance()
      expect(await _weiToEth(balance)).to.equal('10002.0')
    })
  })

  it('should allow a deposit', async () => {
    await fweb3Token.increaseAllowance(fweb3Faucet.address, ethers.utils.parseEther('3333'))
    await fweb3Faucet.depositERC20(ethers.utils.parseEther('333'))

    const erc20Balance = await fweb3Token.balanceOf(fweb3Faucet.address)
    expect(await _weiToEth(erc20Balance)).to.equal('333.0')
  })
})

const _weiToEth = async (_in: BigNumber): Promise<string> => {
  const eth = await ethers.utils.formatEther(_in)
  return eth.toString()
}

// interface Obj {
//   [key: string]: any
// }

// const HUMAN_NAME: Obj = {
//   '0x3C4': 'faucet owner',
//   '0x709': 'drip token owner',
//   '0xf39': 'fweb3 token owner',
//   '0x846': 'drip token',
//   '0xe7f': 'faucet??',
//   '0x5Fb': 'fweb3 token',
//   '0x90F': 'user1',
//   '0x15d': 'user2',
//   '0x663': 'faucet'
// }

// const _printBalance = async (contract: Contract, address: string): Promise<void> => {
//   const balance = await contract.balanceOf(address)
//   const substr = address.substring(0, 5)
//   const humanName = HUMAN_NAME[substr] ?? substr
//   console.log(`${humanName} balance: ${balance}`)
// }

// const _createToken = async (signer: SignerWithAddress): Promise<Contract> => {
//   const Fweb3TokenFactory = await ethers.getContractFactory('Fweb3Token', signer)
//   const fweb3Token = await Fweb3TokenFactory.deploy()
//   await fweb3Token.deployed()
//   return fweb3Token
// }

// const _createDripToken = async (signer: SignerWithAddress): Promise<Contract> => {
//     const DripTokenFactory = await ethers.getContractFactory('DripToken', signer)
//     const dripToken = await DripTokenFactory.deploy()
//     await dripToken.deployed()
//     return dripToken
// }

// const _createFaucet = async (signer: SignerWithAddress, requiredTokenToUse: string): Promise<Contract> => {
//   const Fweb3FaucetFactory = await ethers.getContractFactory('Fweb3TokenFaucet', signer)
//   const fweb3Faucet = await Fweb3FaucetFactory.deploy(requiredTokenToUse, 1, 10, 100, 1)
//   await fweb3Faucet.deployed()
//   return fweb3Faucet
// }

// const _transfer = async (amt: string, _from: Contract, _to: string): Promise<void> => {
//   const tx = await _from.transfer(
//     _to,
//     ethers.utils.parseEther(amt)
//   )
//   await tx.wait()
// }
