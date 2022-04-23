# Fweb3 Game Contracts

| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-92.82%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-76.92%25-red.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-94.64%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-93.48%25-brightgreen.svg?style=flat) |

- solidity 0.8.9
- node 16
- typescript 4
- hardhat 2.9
### Development

```bash
# install deps
yarn

# run tests
yarn test

# tests with coverage
yarn coverage

# fill out env vars from example
yarn hh:node
yarn deploy:local

# use the addresses saved in
# ./deploy_addresses for the frontend

```

### Connect to Ethernal block explorer
1. Create an account and workspace on tryethernal.com
2. `npx ethernal login`
3. `npx ethernal listen`

Notes: If something goes wrong nuke it all
`yarn hh:clean`

### Setup for local cross project app development

Note: These contracts are used for the fweb3 faucets and game app. Currently getting the game app connected locally has some challenges due to how we're checking game progress. This will be updated soon to make development a lot easier.

1. Start hardhat node `yarn hh:node`
2. Fill out env vars.
  - `LOCAL_OWNER_PRIVK=<hardhat account #0>`
  - `LOCAL_USER1_PUBKEY=<hardhat account #1>`
  - `LOCAL_USER2_PUBKEY=<hardhat account #2>`
3. Deploy contracts to localnet `yarn deploy:local`
  - Note: All contract addresses are saved in the `deploy_addresses/<env>/<contract>` folder
4. Open metamask and connect to local rpc on default port
5. In metamask, and import the private keys for account 1 / 2
6. Run setup script to fill both faucets and give user1 / 2 some erc20 (fweb3) tokens
7. Add the local deployed contract addresses from the address folder to the app you're working with.
8. Profit.

---

### Production
```bash
# deploy on other networks

# set correct env vars for network
# deploy on network
yarn deploy:<local|mumbai|polygon>
```
