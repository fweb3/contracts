// SPDX-License-Identifier: UNLICENSED
/**
 * @title Fweb3MaticFaucet
 * @dev ContractDescription
 * @custom:dev-run-script contracts/Fweb3MaticFaucet.sol
 */
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import 'hardhat/console.sol';

contract Fweb3MaticFaucet is Ownable, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256('ADMIN_ROLE');

    IERC20 public erc20Required;
    uint256 public minErc20Required;
    uint256 public minErc20RequiredDecimals;
    uint256 public dripAmount;
    uint256 public decimals;
    uint256 public timeout;
    bool public faucetDisabled;
    bool public singleUse;
    uint256 public allowableExistingBalance;

    mapping(address => bool) private _hasUsedFaucet;
    mapping(address => uint256) private _timeouts;

    event ReceivedEth(address, uint256);
    event DrippedEth(address, uint256);

    constructor(
        uint256 _dripAmount,
        uint256 _decimals,
        uint256 _minErc20RequiredDecimals,
        IERC20 _erc20Required
    ) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);

        dripAmount = _dripAmount * 10**_decimals;
        decimals = _decimals;
        timeout = 3600;
        singleUse = true;
        erc20Required = _erc20Required;
        minErc20RequiredDecimals = _minErc20RequiredDecimals;
        minErc20Required = 300 * 10**_minErc20RequiredDecimals;
        allowableExistingBalance = 1;
    }

    receive() external payable {
        emit ReceivedEth(msg.sender, msg.value);
    }

    function dripMatic(address payable to) external {
        require(!faucetDisabled, 'disabled');

        if (allowableExistingBalance != 0) {
            require(to.balance <= allowableExistingBalance, 'no need');
        }

        require(
            erc20Required.balanceOf(to) >= minErc20Required,
            'missing erc20'
        );

        if (singleUse) {
            require(!_hasUsedFaucet[to], 'used');
        }

        if (timeout != 0) {
            require(_timeouts[to] <= block.timestamp, 'timeout');
        }

        require(address(this).balance >= dripAmount, 'dry');

        (bool success, ) = to.call{value: dripAmount}('');

        require(success, 'send failed');

        _timeouts[to] = block.timestamp + timeout;
        _hasUsedFaucet[to] = true;
        emit DrippedEth(msg.sender, dripAmount);
    }

    function setDisabled(bool val) external onlyRole(ADMIN_ROLE) {
        faucetDisabled = val;
    }

    function setSingleUse(bool shouldBeSingleUse)
        external
        onlyRole(ADMIN_ROLE)
    {
        singleUse = shouldBeSingleUse;
    }

    function setTimeout(uint256 _timeout) external onlyRole(ADMIN_ROLE) {
        timeout = _timeout;
    }

    function setDripAmount(uint256 amount, uint256 _decimals)
        external
        onlyRole(ADMIN_ROLE)
    {
        dripAmount = amount * 10**_decimals;
    }

    function setMinErc20Required(uint256 min, uint256 erc20RequiredDecimals)
        external
        onlyRole(ADMIN_ROLE)
    {
        minErc20Required = min * 10**erc20RequiredDecimals;
    }

    function setAllowablExistingBalance(uint256 amt)
        external
        onlyRole(ADMIN_ROLE)
    {
        allowableExistingBalance = amt;
    }

    function drainEth(address payable to) external onlyOwner {
        to.transfer(address(this).balance);
    }
}
