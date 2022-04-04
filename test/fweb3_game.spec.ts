import { Fweb3Token } from './../typechain-types/contracts/Fweb3Token'
import { Fweb3Game } from './../typechain-types/contracts/Fweb3Game'
import { expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract, ContractFactory, ContractReceipt, utils } from 'ethers'
import { ethers } from 'hardhat'

let fweb3Game: Fweb3Game,
  user1Fweb3Token: Fweb3Token,
  user1Fweb3Game: Fweb3Game, // has tokens
  user2Fweb3Game: Fweb3Game, // no tokens
  fweb3Token: Fweb3Token,
  owner: SignerWithAddress,
  user1: SignerWithAddress,
  user2: SignerWithAddress,
  judgeUser: SignerWithAddress

describe('Fweb3 game contract', async () => {
  beforeEach(async () => {
    ;[owner, user1, user2, judgeUser] = await ethers.getSigners()

    const Fweb3TokenFactory = await ethers.getContractFactory('Fweb3Token')
    fweb3Token = await Fweb3TokenFactory.deploy()
    await fweb3Token.deployed()

    await fweb3Token.transfer(user1.address, utils.parseEther('300'))
    user1Fweb3Token = await fweb3Token.connect(user1)

    const Fweb3GameFactory = await ethers.getContractFactory('Fweb3Game')
    fweb3Game = await Fweb3GameFactory.deploy(fweb3Token.address)
    await fweb3Game.deployed()

    await fweb3Token.transfer(fweb3Game.address, utils.parseEther('1000000'))

    user1Fweb3Game = await fweb3Game.connect(user1)
    user2Fweb3Game = await fweb3Game.connect(user2)
  })

  it('errors if player seeks verification without enough tokens', async () => {
    let error: any
    const user2Fweb3Game: Contract = await fweb3Game.connect(user2)
    try {
      await user2Fweb3Game.seekVerification()
    } catch (e) {
      error = e
    }
    expect(error.message.includes('not enough tokens')).ok
  })
  it('allows only owner to set a judge', async () => {
    let error: any
    await fweb3Game.addJudge(judgeUser.address)
    const userJudgeCheck: boolean = await fweb3Game.isJudge(judgeUser.address)
    expect(userJudgeCheck).ok

    try {
      await user1Fweb3Game.addJudge(judgeUser.address)
    } catch (e) {
      error = e
    }
    expect(error.message.includes('Ownable: caller is not the owner')).ok
  })
  it('lets allowed player to seek verification', async () => {
    const tx = await user1Fweb3Game.seekVerification()
    const receipt = await tx.wait()
    expect(receipt?.events?.[0].event).to.equal('PlayerSeeksVerification')

    const playerDetails = await fweb3Game.getPlayer(user1.address)
    expect(playerDetails.isSeekingVerification).ok
  })

  it('only judges or owner can check judges', async () => {
    await fweb3Game.addJudge(judgeUser.address)
    const notJudge: boolean = await fweb3Game.isJudge(user1.address)
    const isJudge: boolean = await fweb3Game.isJudge(judgeUser.address)
    expect(notJudge).be.false
    expect(isJudge).ok

    const judgeAccountGame: Contract = await fweb3Game.connect(judgeUser)
    const judgeChecksIsJudge: boolean = await judgeAccountGame.isJudge(
      judgeUser.address
    )
    expect(judgeChecksIsJudge).ok
  })

  it('allows owner remove a judge', async () => {
    await fweb3Game.addJudge(judgeUser.address)
    const isJudge: boolean = await fweb3Game.isJudge(judgeUser.address)
    expect(isJudge).ok

    await fweb3Game.removeJudge(judgeUser.address)
    const isJudgeAfterRemove: boolean = await fweb3Game.isJudge(
      judgeUser.address
    )
    expect(isJudgeAfterRemove).be.false

    let error: any
    try {
      await user1Fweb3Game.removeJudge(judgeUser.address)
    } catch (e) {
      error = e
    }
    expect(error.message.includes('Ownable: caller is not the owner')).ok
  })

  it('verifys a player to win', async () => {
    const tx = await user1Fweb3Game.seekVerification()
    const receipt = await tx.wait()
    const playerDetails = await fweb3Game.getPlayer(user1.address)
    expect(playerDetails.isSeekingVerification).ok
    expect(receipt?.events?.[0].event).to.equal('PlayerSeeksVerification')

    const verifyTX = await fweb3Game.verifyPlayer(user1.address)
    const verifyReceipt = await verifyTX.wait()
    const playerDetailsAfterVerify = await fweb3Game.getPlayer(user1.address)
    expect(playerDetailsAfterVerify.isSeekingVerification).be.false
    expect(playerDetailsAfterVerify.verifiedToWin).ok
    expect(verifyReceipt?.events?.[0].event).to.equal('PlayerVerifiedToWin')
  })
  it('wins the game', async () => {
    await fweb3Game.verifyPlayer(user1.address)
    const tx = await user1Fweb3Game.win()
    const receipt = await tx.wait()
    const player = await fweb3Game.getPlayer(user1.address)
    const winner = await fweb3Game.isWinner(user1.address)
    expect(player.hasWon).ok
    expect(winner).ok
    expect(receipt?.events?.[1].event).to.equal('PlayerWon')
  })
  it('wont win if not enough tokens', async () => {
    let error: any
    try {
      await user2Fweb3Game.win()
    } catch (e) {
      error = e
    }
    expect(error.message.includes('not enough tokens')).ok
  })
  it('wont win if hasnt been verified', async () => {
    let error: any
    try {
      await user1Fweb3Game.win()
    } catch (e) {
      error = e
    }
    expect(error.message.includes('not verified')).ok
  })

  it('adds and gets judges', async () => {
    await fweb3Game.addJudge(user1.address)
    await fweb3Game.addJudge(user2.address)
    const judges = await fweb3Game.getJudges()
    expect(judges.length).to.equal(2)
  })
})
