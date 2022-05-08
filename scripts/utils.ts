import fs from 'fs-extra'

const writeAddressToFile = (fileName: string, address: string): void => {
  const path = `deploy_addresses/${process.env.NETWORK}/${fileName}`
  fs.writeFileSync(path, address)
  console.log(`wrote ${fileName} address to ${path}`)
}

const readAddressFromFile = (fileName: string): string => {
  const path = `deploy_addresses/${process.env.NETWORK}/${fileName}`
  const address = fs.readFileSync(path, 'utf-8')
  return address
}

const backupAddresses = () => {
  const backupPath = `deploy_addresses/backup/${Date.now()}`
  fs.copySync(`deploy_addresses/${process.env.NETWORK}`, backupPath)
}

export { writeAddressToFile, readAddressFromFile, backupAddresses }
