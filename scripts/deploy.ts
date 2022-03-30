import { deployFweb3DiamondNFT } from './fweb3_diamond_nft_deploy'
import { deployFweb3TrophyNFT } from './fweb3_trophy_deploy'
import { deployFweb3Faucet } from './fweb3_faucet_deploy'
import { deployFweb3Token } from './fweb3_token_deploy'
import { deployFweb3Game } from './fweb3_game_deploy'
import { deployFweb3Poll } from './fweb3_poll_deploy'

;(async () => {
  try {
    const tokenAddress = await deployFweb3Token()
    const gameAddress = await deployFweb3Game(tokenAddress)
    await deployFweb3Poll(tokenAddress)
    await deployFweb3DiamondNFT()
    await deployFweb3TrophyNFT(gameAddress)
    // TODO: auto set owner allowed to deposit
    await deployFweb3Faucet(tokenAddress)

    console.log('deployed contracts!')
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
})()
