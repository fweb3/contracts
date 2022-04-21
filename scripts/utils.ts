import fs from 'fs-extra'

const writeAddressToFile = (fileName: string, address: string): void => {
  const path = `deploy_addresses/${process.env.SAVE_PATH}/${fileName}`
  fs.writeFileSync(path, address)
  console.log(`wrote ${fileName} address to ${path}`)
}

const readAddressFromFile = (fileName: string): string => {
  const path = `deploy_addresses/${process.env.SAVE_PATH}/${fileName}`
  const address = fs.readFileSync(path, 'utf-8')
  return address
}

export { writeAddressToFile, readAddressFromFile }
