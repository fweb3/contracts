import { deployFweb3DiamondNFT } from './fweb3_diamond_nft_deploy'
import { deployFweb3TrophyNFT } from './fweb3_trophy_deploy'
import { deployERC20Faucet } from './erc20_faucet_deploy'
import { deployFweb3Token } from './fweb3_token_deploy'
import { deployFweb3AdminNFT } from './fweb3_admin_nft'
import { deployEthFaucet } from './eth_faucet_deploy'
import { deployFweb3Game } from './fweb3_game_deploy'
import { deployFweb3Poll } from './fweb3_poll_deploy'

;(async () => {
  try {
    const tokenAddress = await deployFweb3Token()
    const gameAddress = await deployFweb3Game(tokenAddress)
    await deployFweb3Poll(tokenAddress)
    await deployFweb3DiamondNFT()
    await deployFweb3TrophyNFT(gameAddress)
    await deployFweb3AdminNFT()
    await deployEthFaucet(tokenAddress)
    await deployERC20Faucet(tokenAddress)
    console.log('deployed contracts!')
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
})()
