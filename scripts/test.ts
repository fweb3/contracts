import hre from 'hardhat';
;(async () => {
  const [owner] = await hre.ethers.getSigners()
  const Factory = await hre.ethers.getContractFactory('Fweb3Token')
  const token = await Factory.deploy()
  await token.deployed()
  const b = await token.balanceOf(owner.address)
  console.log(b.toString())
})()
