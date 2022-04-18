import { ethers } from 'hardhat'
import { Contract, ContractFactory } from 'ethers'
import fs from 'fs-extra'


;(async () => {
  try {
    const adminNFTAddress = fs.readFileSync(
      'deploy_addresses/mumbai/fweb3_admin_nft',
      'utf-8'
    )

    const [owner] = await ethers.getSigners()

    const Fweb3AdminNFT: ContractFactory = await ethers.getContractFactory(
      'Fweb3AdminNFT'
    )
    const adminNFTContract: Contract = await Fweb3AdminNFT.attach(
      adminNFTAddress
    )

    const tx = await adminNFTContract.mint(
      '0x65eaFA1FBA16E3D85Ea9e663794e4F6e123C4B8A'
    )
    await tx.wait()
    console.log({ tx })
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()

// export { deployFweb3AdminNFT }
