// SPDX-License-Identifier: UNLICENSED
/**
* @title Fweb3Faucet
* @dev ContractDescription
* @custom:dev-run-script contracts/Fweb3Faucet.sol
*/
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract Fweb3TokenFaucet is Ownable {
    ERC20 public erc20Token;
    uint public dripAmount;
    uint public decimals;
    uint public timeout;
    bool public faucetDisabled;
    bool public singleUse;

    mapping(address => bool) private _hasUsedFaucet;
    mapping(address => uint) private _timeouts;

    constructor(
        ERC20 _erc20Token,
        uint _dripAmount,
        uint _decimals,
        uint _timeout,
        bool _singleUse
    ) {
        erc20Token = _erc20Token;
        dripAmount = _dripAmount * 10 ** _decimals;
        decimals = _decimals;
        timeout = _timeout;
        singleUse = _singleUse;
    }

    function dripFweb3(address to) external {
        require(!faucetDisabled, 'drip disabled');

        if (singleUse) {
            require(!_hasUsedFaucet[to], 'already used');
        }

        require(_timeouts[to] <= block.timestamp, 'too early');

        bool success = erc20Token.transfer(to, dripAmount);

        require(success, 'send fail');

        _timeouts[to] = block.timestamp + timeout;
        _hasUsedFaucet[to] = true;
    }

    function setDisableFaucet(bool val) external onlyOwner {
        faucetDisabled = val;
    }

    function setSingleUse(bool shouldBeSingleUse) external onlyOwner {
        singleUse = shouldBeSingleUse;
    }

    function setTimeout(uint newTimeout) external onlyOwner {
        timeout = newTimeout;
    }

    function setDripAmount(uint amount, uint _decimals) external onlyOwner {
        decimals = _decimals;
        dripAmount = amount * 10 ** _decimals;
    }
}
