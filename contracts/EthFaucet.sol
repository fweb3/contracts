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
        ethDripAmount = _ethDripAmount * 10 ** 18;
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
        require(success, 'Failed to send Ether');
        timeouts[_to] = block.timestamp;
        hasUsedFaucet[_to] = true;
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
      require(!faucetDisabled, 'drip disabled');
    }

    function _isBlockedAccount(address _account) private view {
      require(!blockedAccounts[_account], 'address blocked');
    }

    function _hasMinERC20Tokens(address _to) private view {
        require(
            erc20RequiredToken.balanceOf(_to) >= erc20RequiredAmountToUseFaucet,
            'not enough tokens'
        );
    }

    function _contractHasEnoughEth() private view {
        require(
            address(this).balance >= ethDripAmount,
            'insufficient funds'
        );
    }

    function _isTimedOut(address _to) private view {
        require(
            timeouts[_to] <= block.timestamp,
            'to early'
        );
    }

    function _checkSingleUse(address _to) private view {
      require(!singleUse && !hasUsedFaucet[_to], "you have already used faucet");
    }

    function getFaucetDisabled() public view onlyOwner returns (bool) {
      return faucetDisabled;
    }

    function setFaucetDisabled(bool _val) public onlyOwner {
      faucetDisabled = _val;
    }

    function blockAccount(address _account) public onlyOwner {
        blockedAccounts[_account] = true;
    }

    function unblockAccount(address _account) public onlyOwner {
        delete blockedAccounts[_account];
    }

    function getEthBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getEthDripAmount() public view onlyOwner returns (uint256) {
        return ethDripAmount;
    }

    function setEthDripAmount(uint256 _amount) public onlyOwner {
        ethDripAmount = _amount;
    }

    function getSingleUse() public view returns (bool) {
      return singleUse;
    }

    function setSingleUse(bool _shouldBeSingleUse) public onlyOwner {
      singleUse = _shouldBeSingleUse;
    }

    function getTimeout() public view returns (uint256) {
      return timeout;
    }

    function setTimeout(uint256 _timeout) public onlyOwner {
      timeout = _timeout;
    }

    function getHasUsedFaucet(address _account) public view returns (bool) {
      return hasUsedFaucet[_account];
    }

    function setHasUsedFaucet(address _account) public onlyOwner {
      hasUsedFaucet[_account] = true;
    }
}
