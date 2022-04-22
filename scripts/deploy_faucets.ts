import { deployFweb3Faucet } from "./fweb3_faucet_deploy";
import { deployMaticFaucet } from './fweb3_matic_faucet_deploy'
import { deployFweb3Token } from "./fweb3_token_deploy";
// import { readAddressFromFile } from './utils'

;(async () => {
  const fweb3TokenAddress = await deployFweb3Token()
  const maticFaucetAddress = await deployMaticFaucet(fweb3TokenAddress)
  const fweb3FaucetAddress = await deployFweb3Faucet(fweb3TokenAddress)
  const faucets = {
    fweb3TokenAddress,
    maticFaucetAddress,
    fweb3FaucetAddress,
  }
  console.log({
    fweb3TokenAddress,
    maticFaucetAddress,
    fweb3FaucetAddress,
  })
  return faucets
})()
