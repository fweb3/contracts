// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

import 'hardhat/console.sol';

contract ERC20Faucet is Ownable {
    ERC20 private erc20Token;
    uint256 private erc20DripAmount;
    uint256 private timeout;
    bool private faucetDisabled;
    bool private singleUse;

    mapping(address => bool) private hasUsedFaucet;
    mapping(address => uint256) private timeouts;
    mapping(address => bool) private blockedAccounts;

    event SentERC20Tokens(address indexed account, uint256 timestamp);

    constructor(
        ERC20 _erc20Token,
        uint256 _erc20DripAmount,
        uint256 _timeout,
        bool _singleUse
    ) {
        erc20Token = _erc20Token;
        erc20DripAmount = _erc20DripAmount;
        timeout = _timeout;
        singleUse = _singleUse;
    }

    function dripERC20(address _to) external {
        _canUseFaucet(_to);
        bool success = erc20Token.transfer(_to, erc20DripAmount);
        require(success, 'send fail');
        setAccountTimeout(_to, block.timestamp + timeout);
        setHasUsedFaucet(_to);
        emit SentERC20Tokens(_to, block.timestamp);
    }

    function _canUseFaucet(address _to) private view {
        _isfaucetDisabled();
        _isBlockedAccount(_to);
        _isTimedOut(_to);
        _checkSingleUse(_to);
    }

    function _isfaucetDisabled() private view {
        require(!faucetDisabled, 'drip disabled');
    }

    function _isBlockedAccount(address _account) private view {
        require(!getBlockedAccount(_account), 'address blocked');
    }

    function _isTimedOut(address _to) private view {
        require(getAccountTimeout(_to) <= block.timestamp, 'too early');
    }

    function _checkSingleUse(address _to) private view {
        if (singleUse) {
            require(!getHasUsedFaucet(_to), 'already used');
        }
    }

    function getFaucetDisabled() public view onlyOwner returns (bool) {
        return faucetDisabled;
    }

    function setFaucetDisabled(bool _val) public onlyOwner {
        faucetDisabled = _val;
    }

    function getBlockedAccount(address _account) public view returns (bool) {
        return blockedAccounts[_account];
    }

    function setBlockedAccount(address _account, bool _val) public onlyOwner {
        blockedAccounts[_account] = _val;
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

    function getAccountTimeout(address _account)
        public
        view
        onlyOwner
        returns (uint256)
    {
        return timeouts[_account];
    }

    function setAccountTimeout(address _account, uint256 _seconds) internal {
        timeouts[_account] = block.timestamp + _seconds;
    }

    function getHasUsedFaucet(address _account) public view returns (bool) {
        return hasUsedFaucet[_account];
    }

    function setHasUsedFaucet(address _account) public onlyOwner {
        hasUsedFaucet[_account] = true;
    }
}
