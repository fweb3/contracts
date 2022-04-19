import { deployFweb3DiamondNFT } from './fweb3_diamond_nft_deploy'
import { deployFweb3TrophyNFT } from './fweb3_trophy_deploy'
import { deployERC20Faucet } from './erc20_faucet_deploy'
import { deployFweb3Token } from './fweb3_token_deploy'
import { deployFweb3AdminNFT } from './fweb3_admin_nft'
import { deployEthFaucet } from './eth_faucet_deploy'
import { deployFweb3Game } from './fweb3_game_deploy'
import { deployFweb3Poll } from './fweb3_poll_deploy'
// import hre from 'hardhat'

;(async () => {
  try {
    // if (process.env.SAVE_PATH === 'local') {
    //   await hre.ethernal.resetWorkspace('Fweb3')
    // }
    const tokenAddress = await deployFweb3Token()
    // await hre.ethernal.push({
    //   name: 'Fweb3Token',
    //   address: tokenAddress,
    // })
    const gameAddress = await deployFweb3Game(tokenAddress)
    await deployFweb3Poll(tokenAddress)
    await deployFweb3DiamondNFT()
    await deployFweb3TrophyNFT(gameAddress)
    await deployFweb3AdminNFT()
    const ethFaucetAddress = await deployEthFaucet(tokenAddress)
    // await hre.ethernal.push({
    //   name: 'EthFaucet',
    //   address: ethFaucetAddress,
    // })
    const erc20FaucetAddress = await deployERC20Faucet(tokenAddress)
    // await hre.ethernal.push({
    //   name: 'Erc20Faucet',
    //   address: erc20FaucetAddress,
    // })
    console.log('deployed contracts!')
    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
})()
