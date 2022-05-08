import { deployFweb3Faucet } from './fweb3_faucet_deploy'
import { deployMaticFaucet } from './fweb3_matic_faucet_deploy'
import { readAddressFromFile } from './utils'
import hre from 'hardhat'
;(async () => {
  const fweb3TokenAddress = readAddressFromFile('fweb3_token')
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
