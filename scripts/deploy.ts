import { deployFweb3DiamondNFT } from './fweb3_diamond_nft_deploy'
import { deployFweb3TrophyNFT } from './fweb3_trophy_deploy'
import { deployERC20Faucet } from './erc20_faucet_deploy'
import { deployFweb3Token } from './fweb3_token_deploy'
import { deployFweb3AdminNFT } from './fweb3_admin_nft'
import { deployEthFaucet } from './eth_faucet_deploy'
import { deployFweb3Game } from './fweb3_game_deploy'
import { deployFweb3Poll } from './fweb3_poll_deploy'

// import hre from 'hardhat'
// const _sendToEthernal = async (addresses: any) => {
//   if (process.env.SAVE_PATH === 'local') {
//     const {
//       tokenAddress,
//       gameAddress,
//       pollAddress,
//       diamondNft,
//       trophyNft,
//       adminNft,
//       ethFaucetAddress,
//       erc20FaucetAddress,
//     } = addresses
//     await hre.ethernal.resetWorkspace('Fweb3')
//     await hre.ethernal.push({
//       name: 'Fweb3Token',
//       address: tokenAddress,
//     })
//     await hre.ethernal.push({
//       name: 'EthFaucet',
//       address: ethFaucetAddress,
//     })
//     await hre.ethernal.push({
//       name: 'Erc20Faucet',
//       address: erc20FaucetAddress,
//     })
//   }
// }

;(async () => {
  try {

    const tokenAddress = await deployFweb3Token()
    const gameAddress = await deployFweb3Game(tokenAddress)
    const pollAddress = await deployFweb3Poll(tokenAddress)
    const diamondNft = await deployFweb3DiamondNFT()
    const trophyNft = await deployFweb3TrophyNFT(gameAddress)
    const adminNft = await deployFweb3AdminNFT()
    const ethFaucetAddress = await deployEthFaucet(tokenAddress)

    const erc20FaucetAddress = await deployERC20Faucet(tokenAddress)

    const addresses = {
      tokenAddress,
      gameAddress,
      pollAddress,
      diamondNft,
      trophyNft,
      adminNft,
      ethFaucetAddress,
      erc20FaucetAddress
    }
    // await _sendToEthernal(addresses)
    console.log('deployed contracts!')
    console.log({ addresses })
    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
})()
