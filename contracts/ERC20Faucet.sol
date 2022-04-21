// SPDX-License-Identifier: UNLICENSED
/**
* @title Erc20Faucet
* @dev ContractDescription
* @custom:dev-run-script contracts/ERC20Faucet.sol
*/
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract ERC20Faucet is Ownable {
    ERC20 private _erc20Token;
    uint private _dripAmount;
    uint private _timeout;
    bool private _faucetDisabled;
    bool private _singleUse;

    mapping(address => bool) private _hasUsedFaucet;
    mapping(address => uint) private _timeouts;

    constructor(
        ERC20 erc20Token,
        uint dripAmount,
        uint timeout,
        bool singleUse
    ) {
        _erc20Token = erc20Token;
        _dripAmount = dripAmount;
        _timeout = timeout;
        _singleUse = singleUse;
    }

    function dripERC20(address to) external {
        require(!_faucetDisabled, 'drip disabled');

        if (_singleUse) {
            require(!_hasUsedFaucet[to], 'already used');
        }

        require(_timeouts[to] <= block.timestamp, 'too early');

        bool success = _erc20Token.transfer(to, _dripAmount);

        require(success, 'send fail');

        _timeouts[to] = block.timestamp + _timeout;
        _hasUsedFaucet[to] = true;
    }

    function setDisableFaucet(bool val) external onlyOwner {
        _faucetDisabled = val;
    }

    function getSingleUse() external view onlyOwner returns(bool) {
        return _singleUse;
    }

    function setSingleUse(bool shouldBeSingleUse) external onlyOwner {
        _singleUse = shouldBeSingleUse;
    }

    function setTimeout(uint timeout) external onlyOwner {
        _timeout = timeout;
    }

    function getDripAmount() external view onlyOwner returns (uint) {
        return _dripAmount;
    }

    function setDripAmount(uint amount) external onlyOwner {
        _dripAmount = amount;
    }
}
