// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract EthFaucet is Ownable {
    IERC20 private _erc20RequiredToken;
    uint private _erc20RequiredAmountToUseFaucet;
    uint public decimals;
    uint public dripAmount;
    uint private _timeout;
    bool public faucetDisabled;
    bool public singleUse;

    mapping(address => bool) private _hasUsedFaucet;
    mapping(address => uint) private _timeouts;

    event ReceivedEth(address, uint);

    constructor(
        uint _dripAmount,
        uint _decimals,
        uint timeout,
        bool _singleUse,
        IERC20 erc20RequiredToken,
        uint erc20RequiredAmountToUseFaucet
    ) {
        dripAmount = _dripAmount;
        decimals = _decimals;
        _timeout = timeout;
        singleUse = _singleUse;
        _erc20RequiredToken = erc20RequiredToken;
        _erc20RequiredAmountToUseFaucet = erc20RequiredAmountToUseFaucet;
    }

    receive() external payable {
        emit ReceivedEth(msg.sender, msg.value);
    }

    function dripEth(address payable to) external {
        require(!faucetDisabled, 'disabled');
        require(address(this).balance >= dripAmount, 'insufficient funds');
        require(
            _erc20RequiredToken.balanceOf(to) >= _erc20RequiredAmountToUseFaucet,
            'missing erc20'
        );
        if (singleUse) {
            require(!_hasUsedFaucet[to], 'already used');
        }
        require(_timeouts[to] <= block.timestamp, 'too soon');

        (bool success, ) = to.call{value: dripAmount * 10 ** decimals}('');

        require(success, 'send failed');
        _timeouts[to] = block.timestamp + _timeout;
        _hasUsedFaucet[to] = true;
    }

    function setDisabled(bool val) external onlyOwner {
        faucetDisabled = val;
    }

    function setSingleUse(bool shouldBeSingleUse) external onlyOwner {
        singleUse = shouldBeSingleUse;
    }

    function setTimeout(uint timeout) external onlyOwner {
        _timeout = timeout;
    }

    function setDripAmount(uint amount) external onlyOwner {
        dripAmount = amount;
    }

    function setDripDecimals(uint _decimals) external onlyOwner {
        decimals = _decimals;
    }
 }
