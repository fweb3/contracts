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
    uint256 public dripAmount;
    uint256 public decimals;
    uint256 public timeout;
    bool public faucetDisabled;
    bool public singleUse;

    mapping(address => bool) private _hasUsedFaucet;
    mapping(address => uint256) private _timeouts;

    event ReceivedEth(address, uint);

    constructor(
        ERC20 _erc20Token,
        uint256 _dripAmount,
        uint256 _decimals,
        uint256 _timeout,
        bool _singleUse
    ) {
        erc20Token = _erc20Token;
        dripAmount = _dripAmount * 10**_decimals;
        decimals = _decimals;
        timeout = _timeout;
        singleUse = _singleUse;
    }

    receive() external payable {
        emit ReceivedEth(msg.sender, msg.value);
    }

    function dripFweb3(address to) external {
        require(!faucetDisabled, 'disabled');
        require(erc20Token.balanceOf(address(this)) >= dripAmount, 'dry');
        if (singleUse) {
            require(!_hasUsedFaucet[to], 'already used');
        }

        require(_timeouts[to] <= block.timestamp, 'too soon');

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

    function setTimeout(uint256 newTimeout) external onlyOwner {
        timeout = newTimeout;
    }

    function setDripAmount(uint256 amount, uint256 _decimals)
        external
        onlyOwner
    {
        decimals = _decimals;
        dripAmount = amount * 10**_decimals;
    }
}
