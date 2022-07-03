import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import {
  Fweb3TrophyNFT,
  OriginalGame,
  GameVerification,
  Fweb3,
} from '../typechain-types'

let owner: SignerWithAddress,
  user1: SignerWithAddress,
  verificationContract: GameVerification,
  trophy: Fweb3TrophyNFT,
  game: OriginalGame,
  token: Fweb3

describe('GameVerification', () => {
  beforeEach(async () => {
    ;[owner, user1] = await ethers.getSigners()

    const TokenFactory = await ethers.getContractFactory('Fweb3')
    token = await TokenFactory.deploy()
    await token.deployed()

    const GameFactory = await ethers.getContractFactory('OriginalGame')
    game = await GameFactory.deploy(token.address)
    await game.deployed()

    const TrophyFactory = await ethers.getContractFactory('Fweb3TrophyNFT')
    trophy = await TrophyFactory.deploy(game.address)
    await trophy.deployed()

    const GameVerificationFactory = await ethers.getContractFactory(
      'GameVerification'
    )
    verificationContract = await GameVerificationFactory.deploy(
      token.address,
      trophy.address
    )
    await verificationContract.deployed()

  })
  // needs to seek verification? no
  // has been verified: verifyPlayer()
  // not won before
  it('calls trophy contract to check if account already has a trophy', async () => {
    // has tokens >= 100
    await token.transfer(user1.address, ethers.utils.parseEther('100'))

    // const user1TrophyContract = await trophy.connect(user1)
    // await user1TrophyContract.mint()
    const nft = await verificationContract.hasTrophyAlready(user1.address)
    console.log({ value: nft.value })
  })
})
