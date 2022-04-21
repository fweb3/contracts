// SPDX-License-Identifier: MIT
/**
* @title Fweb3
* @dev ContractDescription
* @custom:dev-run-script contracts/Fweb3Token.sol
*/

pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol';

contract Fweb3Token is ERC20, ERC20Burnable {
    constructor() ERC20('Fweb3', 'FWEB3') {
        _mint(msg.sender, 10000000 * 10**decimals());
    }
}
