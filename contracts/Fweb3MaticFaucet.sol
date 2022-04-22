// SPDX-License-Identifier: UNLICENSED
/**
* @title Fweb3MaticFaucet
* @dev ContractDescription
* @custom:dev-run-script contracts/Fweb3MaticFaucet.sol
*/
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract Fweb3MaticFaucet is Ownable, AccessControl {

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    IERC20 private _erc20RequiredToken;
    uint private _erc20RequiredAmountToUseFaucet;
    uint public dripAmount;
    uint public decimals;
    uint private _timeout;
    bool public faucetDisabled;
    bool public singleUse;
    uint private _cooldown;
    uint private _lastDrip;
    bool private _cooldownEnabled;

    mapping(address => bool) private _hasUsedFaucet;
    mapping(address => uint) private _timeouts;

    event ReceivedEth(address, uint);

    constructor(
        uint _dripAmount,
        uint _decimals,
        uint timeout,
        bool _singleUse,
        IERC20 erc20RequiredToken,
        uint requiredFweb3ForFaucet
    ) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);

        dripAmount = _dripAmount * 10 ** _decimals;
        decimals = _decimals;
        _timeout = timeout;
        singleUse = _singleUse;
        _erc20RequiredToken = erc20RequiredToken;
        _erc20RequiredAmountToUseFaucet = requiredFweb3ForFaucet;
        _cooldownEnabled = false;
        _cooldown = 1;
    }

    receive() external payable {
        emit ReceivedEth(msg.sender, msg.value);
    }

    function dripMatic(address payable to) external {
        require(!faucetDisabled, 'disabled');
        require(address(this).balance >= dripAmount, 'dry');
        require(
            _erc20RequiredToken.balanceOf(to) >= _erc20RequiredAmountToUseFaucet,
            'missing fweb3'
        );

        if (singleUse) {
            require(!_hasUsedFaucet[to], 'already used');
        }

        if (_cooldownEnabled) {
            require((_lastDrip + block.timestamp + _cooldown) <= block.timestamp, 'cooldown');
        }

        require(_timeouts[to] <= block.timestamp, 'too soon');

        (bool success, ) = to.call{value: dripAmount}('');

        require(success, 'send failed');
        _timeouts[to] = block.timestamp + _timeout;
        _hasUsedFaucet[to] = true;
        _lastDrip = block.timestamp;
    }

    function setDisabled(bool val) external onlyRole(ADMIN_ROLE) {
        faucetDisabled = val;
    }

    function setSingleUse(bool shouldBeSingleUse) external onlyRole(ADMIN_ROLE) {
        singleUse = shouldBeSingleUse;
    }

    function setTimeout(uint timeout) external onlyRole(ADMIN_ROLE) {
        _timeout = timeout;
    }

    function setDripAmount(uint amount, uint _decimals) external onlyRole(ADMIN_ROLE) {
        dripAmount = amount * 10 ** _decimals;
    }

    function setCooldown(uint mins) external onlyRole(ADMIN_ROLE) {
        _cooldown = mins;
    }

    function setCooldownEnabled(bool val) external onlyRole(ADMIN_ROLE) {
        _cooldownEnabled = val;
    }
 }
