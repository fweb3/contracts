import { deployFweb3Faucet } from "./fweb3_faucet_deploy";
import { deployMaticFaucet } from './fweb3_matic_faucet_deploy'
import { deployFweb3Token } from "./fweb3_token_deploy";
import { readAddressFromFile } from './utils'

// const PROD_FWEB3_TOKEN = '0x4a14ac36667b574b08443a15093e417db909d7a3'

;(async () => {
  // const maticFaucetAddress = await deployMaticFaucet(PROD_FWEB3_TOKEN)
  // const fweb3FaucetAddress = await deployFweb3Faucet(PROD_FWEB3_TOKEN)

  const fweb3TokenAddress = await deployFweb3Token()
  // const fweb3TokenAddress = await readAddressFromFile('fweb3_token')
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
