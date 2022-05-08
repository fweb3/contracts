import { deployFweb3Faucet } from './fweb3_faucet_deploy'
import { deployMaticFaucet } from './fweb3_matic_faucet_deploy'
import { deployFweb3Token } from './fweb3_token_deploy'



;(async () => {
  const fweb3TokenAddress = await deployFweb3Token()
  const maticFaucetAddress = await deployMaticFaucet(fweb3TokenAddress)
  const fweb3FaucetAddress = await deployFweb3Faucet(fweb3TokenAddress)
  const faucets = {
    maticFaucetAddress,
    fweb3FaucetAddress,
    fweb3TokenAddress,
  }
  console.log(faucets)
  return faucets
})()
