import fs from 'fs-extra'
import hre from 'hardhat'

const ROOT_ARTIFACT_PATH = 'artifacts/contracts'
const ROOT_ADDRESS_PATH = 'deploy_addresses'
const ROOT_ABI_PATH = 'deploy_abis'

const writeAddressToFile = (fileName: string, address: string): void => {
  const path = `${ROOT_ADDRESS_PATH}/${hre.network.name}/${fileName}`
  fs.writeFileSync(path, address)
  console.log(`wrote ${fileName} address to ${path}`)
}

const readAddressFromFile = (fileName: string): string => {
  const path = `${ROOT_ADDRESS_PATH}/${hre.network.name}/${fileName}`
  const address = fs.readFileSync(path, 'utf-8')
  return address
}

const backupAddresses = () => {
  const backupPath = `${ROOT_ADDRESS_PATH}/backup/${Date.now()}`
  fs.copySync(`${ROOT_ADDRESS_PATH}/${hre.network.name}`, backupPath)
}


const _getAbi = (contractName: string) => {
  const file = fs.readFileSync(
    `${ROOT_ARTIFACT_PATH}/${contractName}.sol/${contractName}.json`,
    'utf-8'
  )
  return file
}

const copyContractInterface = (contractName: string) => {
  const data = _getAbi(contractName)
  fs.writeFileSync(`${ROOT_ABI_PATH}/${contractName}.json`, data)
}

export { writeAddressToFile, readAddressFromFile, backupAddresses, copyContractInterface }
