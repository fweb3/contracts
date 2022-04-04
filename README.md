# Fweb3 Game Contracts

| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-96.55%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-75.81%25-red.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-100%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-97.28%25-brightgreen.svg?style=flat) |

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

# deployment
# fill out env vars from example
yarn hh node
yarn deploy:local

```

---

### Production
```bash
# deploy on other networks

# set correct env vars for network
# deploy on network
yarn deploy:<local|mumbai|polygon>
```
