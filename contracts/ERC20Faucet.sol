// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract ERC20Faucet is Ownable {
    ERC20 private erc20Token;
    uint256 private dripAmount;
    uint256 private timeout;
    bool private faucetDisabled;
    bool private singleUse;

    mapping(address => bool) private hasUsedFaucet;
    mapping(address => uint256) private timeouts;

    constructor(
        ERC20 _erc20Token,
        uint256 _dripAmount,
        uint256 _timeout,
        bool _singleUse
    ) {
        erc20Token = _erc20Token;
        dripAmount = _dripAmount;
        timeout = _timeout;
        singleUse = _singleUse;
    }

    function dripERC20(address _to) external {
        require(!faucetDisabled, 'drip disabled');

        if (singleUse) {
            require(!hasUsedFaucet[_to], 'already used');
        }

        require(timeouts[_to] <= block.timestamp, 'too early');

        bool success = erc20Token.transfer(_to, dripAmount);

        require(success, 'send fail');

        timeouts[_to] = block.timestamp + timeout;
        hasUsedFaucet[_to] = true;
    }

    function setDisableFaucet(bool _val) external onlyOwner {
        faucetDisabled = _val;
    }

    function setSingleUse(bool _shouldBeSingleUse) external onlyOwner {
        singleUse = _shouldBeSingleUse;
    }

    function setTimeout(uint256 _timeout) external onlyOwner {
        timeout = _timeout;
    }

    function setDripAmount(uint16 _amount) external onlyOwner {
        dripAmount = _amount;
    }
}
