// SPDX-License-Identifier: UNLICENSED
/**
 * @title Fweb3Faucet
 * @dev ContractDescription
 * @custom:dev-run-script contracts/Fweb3Faucet.sol
 */
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract Fweb3TokenFaucet is Ownable, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256('ADMIN_ROLE');

    ERC20 public erc20Token;
    uint256 public dripAmount;
    uint256 public decimals;
    uint256 public timeout;
    bool public faucetDisabled;
    bool public singleUse;
    uint256 public holderLimit;
    bool public useHolderLimit;

    mapping(address => bool) private _hasUsedFaucet;
    mapping(address => uint256) private _timeouts;

    event ReceivedEth(address, uint256);
    event DrippedErc20(address, uint256);

    constructor(
        ERC20 _erc20Token,
        uint256 _dripAmount,
        uint256 _decimals
    ) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);

        erc20Token = _erc20Token;
        dripAmount = _dripAmount * 10**_decimals;
        decimals = _decimals;
        timeout = 0;
        singleUse = true;
        holderLimit = 300 * 10**18;
    }

    receive() external payable {
        emit ReceivedEth(msg.sender, msg.value);
    }

    function dripFweb3(address to) external {
        require(!faucetDisabled, 'disabled');
        require(erc20Token.balanceOf(address(this)) >= dripAmount, 'dry');
        require(erc20Token.balanceOf(to) < holderLimit, 'limit');

        if (singleUse) {
            require(!_hasUsedFaucet[to], 'used');
        }

        if (timeout != 0) {
            require(_timeouts[to] <= block.timestamp, 'timeout');
        }
        
        require(erc20Token.balanceOf(address(this)) >= dripAmount, 'dry');

        bool success = erc20Token.transfer(to, dripAmount);

        require(success, 'send fail');

        _timeouts[to] = block.timestamp + timeout;
        _hasUsedFaucet[to] = true;

        emit DrippedErc20(msg.sender, dripAmount);
    }

    function setDisableFaucet(bool val) external onlyRole(ADMIN_ROLE) {
        faucetDisabled = val;
    }

    function setSingleUse(bool shouldBeSingleUse)
        external
        onlyRole(ADMIN_ROLE)
    {
        singleUse = shouldBeSingleUse;
    }

    function setTimeout(uint256 newTimeout) external onlyRole(ADMIN_ROLE) {
        timeout = newTimeout;
    }

    function setDripAmount(uint256 amount, uint256 _decimals)
        external
        onlyOwner
    {
        decimals = _decimals;
        dripAmount = amount * 10**_decimals;
    }

    function setHolderLimit(uint256 limit) external onlyRole(ADMIN_ROLE) {
        holderLimit = limit * 10**18;
    }

    function clearTimeout(address forWhom) external onlyRole(ADMIN_ROLE) {
        _timeouts[forWhom] = 0;
    }

    function drainEth(address payable to) external onlyOwner {
        to.transfer(address(this).balance);
    }

    function drainErc20(address payable to) external onlyOwner {
        uint256 balance = erc20Token.balanceOf(address(this));
        bool success = erc20Token.transfer(to, balance);
        require(success, 'transfer failed');
    }
}
