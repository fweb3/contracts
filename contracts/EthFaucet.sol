// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

import 'hardhat/console.sol';

contract EthFaucet is Ownable {
    IERC20 private erc20RequiredToken;
    uint256 private erc20RequiredAmountToUseFaucet;
    uint256 private ethDripAmount;
    uint256 private timeout;
    bool public faucetDisabled;
    bool private singleUse;

    mapping(address => bool) private hasUsedFaucet;
    mapping(address => uint256) private timeouts;
    mapping(address => bool) private blockedAccounts;

    event ReceivedEth(address, uint256);

    constructor(
        uint256 _ethDripAmount,
        uint256 _timeout,
        bool _singleUse,
        IERC20 _erc20RequiredToken,
        uint256 _erc20RequiredAmountToUseFaucet
    ) {
        ethDripAmount = _ethDripAmount;
        timeout = _timeout;
        singleUse = _singleUse;
        erc20RequiredToken = _erc20RequiredToken;
        erc20RequiredAmountToUseFaucet = _erc20RequiredAmountToUseFaucet;
    }

    receive() external payable {
        emit ReceivedEth(msg.sender, msg.value);
    }

    function dripEth(address payable _to) external {
        _canUseFaucet(_to);
        (bool success, ) = _to.call{value: ethDripAmount}('');
        require(success, 'send failed');
        setAccountTimeout(_to, timeout);
        setHasUsedFaucet(_to, true);
    }

    function _canUseFaucet(address _to) private view {
        _isfaucetDisabled();
        _isBlockedAccount(_to);
        _checkSingleUse(_to);
        _hasMinERC20Tokens(_to);
        _isTimedOut(_to);
        _contractHasEnoughEth();
    }

    function _isfaucetDisabled() private view {
        require(!faucetDisabled, 'disabled');
    }

    function _isBlockedAccount(address _account) private view {
        require(!blockedAccounts[_account], 'blocked');
    }

    function _hasMinERC20Tokens(address _account) private view {
        require(
            erc20RequiredToken.balanceOf(_account) >= erc20RequiredAmountToUseFaucet,
            'missing erc20'
        );
    }

    function _contractHasEnoughEth() private view {
        require(address(this).balance >= ethDripAmount, 'insufficient funds');
    }

    function _isTimedOut(address _account) private view {
        require(getAccountTimeout(_account) <= block.timestamp, 'to early');
    }

    function _checkSingleUse(address _account) private view {
        if (singleUse) {
            require(!getHasUsedFaucet(_account), 'already used');
        }
    }

    function getDisabled() external view onlyOwner returns (bool) {
        return faucetDisabled;
    }

    function setDisabled(bool _val) external onlyOwner {
        faucetDisabled = _val;
    }

    function setBlockedAccount(address _account, bool _val) external onlyOwner {
        blockedAccounts[_account] = _val;
    }

    function getBlockedAccount(address _account) external view onlyOwner returns (bool) {
        return blockedAccounts[_account];
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getDripAmount() external view onlyOwner returns (uint256) {
        return ethDripAmount;
    }

    function setDripAmount(uint256 _amount) external onlyOwner {
        ethDripAmount = _amount;
    }

    function getSingleUse() external view onlyOwner returns (bool) {
        return singleUse;
    }

    function setSingleUse(bool _shouldBeSingleUse) external onlyOwner {
        singleUse = _shouldBeSingleUse;
    }

    function getTimeout() external view returns (uint256) {
        return timeout;
    }

    function setTimeout(uint256 _timeout) external onlyOwner {
        timeout = _timeout;
    }

    function getAccountTimeout(address _account)
        internal
        view
        onlyOwner
        returns (uint256)
    {
        return timeouts[_account];
    }

    function setAccountTimeout(address _account, uint256 _val) internal onlyOwner {
      timeouts[_account] = block.timestamp + _val;
    }

    function getHasUsedFaucet(address _account)
        internal
        view
        onlyOwner
        returns (bool)
    {
        return hasUsedFaucet[_account];
    }

    function setHasUsedFaucet(address _account, bool _val) internal onlyOwner {
        hasUsedFaucet[_account] = _val;
    }
}
