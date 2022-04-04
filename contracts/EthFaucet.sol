// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

import 'hardhat/console.sol';

contract EthFaucet is Ownable {
    IERC20 private erc20RequiredToken;
    uint256 private erc20RequiredAmountToUseFaucet;
    uint256 private dripAmount;
    uint256 private timeout;
    bool public faucetDisabled;
    bool private singleUse;

    mapping(address => bool) private hasUsedFaucet;
    mapping(address => uint256) private timeouts;

    event ReceivedEth(address, uint256);

    constructor(
        uint256 _dripAmount,
        uint32 _timeout,
        bool _singleUse,
        IERC20 _erc20RequiredToken,
        uint32 _erc20RequiredAmountToUseFaucet
    ) {
        dripAmount = _dripAmount * 10 ** 18;
        timeout = _timeout;
        singleUse = _singleUse;
        erc20RequiredToken = _erc20RequiredToken;
        erc20RequiredAmountToUseFaucet = _erc20RequiredAmountToUseFaucet;
    }

    receive() external payable {
        emit ReceivedEth(msg.sender, msg.value);
    }

    function dripEth(address payable _to) external {
        require(!faucetDisabled, 'disabled');
        require(address(this).balance >= dripAmount, 'insufficient funds');
        require(
            erc20RequiredToken.balanceOf(_to) >= erc20RequiredAmountToUseFaucet,
            'missing erc20'
        );
        if (singleUse) {
            require(!hasUsedFaucet[_to], 'already used');
        }
        require(timeouts[_to] <= block.timestamp, 'too soon');

        (bool success, ) = _to.call{value: dripAmount}('');

        require(success, 'send failed');
        timeouts[_to] = block.timestamp + timeout;
        hasUsedFaucet[_to] = true;
    }

    function setDisabled(bool _val) external onlyOwner {
        faucetDisabled = _val;
    }

    function setSingleUse(bool _shouldBeSingleUse) external onlyOwner {
        singleUse = _shouldBeSingleUse;
    }

    function setTimeout(uint256 _timeout) external onlyOwner {
        timeout = _timeout;
    }

    function setDripAmount(uint256 _amount) external onlyOwner {
        dripAmount = _amount * 10 ** 18;
    }
}
