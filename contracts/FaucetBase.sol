// SPDX-License-Identifier: UNLICENSED
/**
 * @title FaucetBase
 * @dev ContractDescription
 * @custom:dev-run-script contracts/FaucetBase.sol
 */
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract FaucetBase is AccessControl, Ownable {
    bytes32 public constant ADMIN_ROLE = keccak256('ADMIN_ROLE');
    uint256 public dripAmount;
    uint256 public dripBase;
    uint256 public decimals;
    uint256 public timeout;
    bool public faucetDisabled;
    bool public singleUse;
    uint256 public holderLimit;

    mapping(address => bool) _hasUsedFaucet;
    mapping(address => uint256) _timeouts;

    event ReceivedDeposit(address, uint256);
    event Dripped(address, string, uint256);

    modifier meetsFaucetRequirements(address to) {
        require(!faucetDisabled, 'FAUCET_DISABLED');
        // < 10 Gwei
        require(address(this).balance >= 1 * 10**10, 'FAUCET_DRY');

        if (singleUse) {
            require(!_hasUsedFaucet[to], 'SINGLE_USE');
        }

        if (timeout > 0) {
            require(_timeouts[to] <= block.timestamp, 'WALLET_TIMEOUT');
        }

        _;
    }

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    receive() external payable {
        emit ReceivedDeposit(msg.sender, msg.value);
    }

    function updateAddressState(address to) internal {
        if (timeout > 0) {
            _timeouts[to] = block.timestamp + timeout;
        }

        if (singleUse) {
            _hasUsedFaucet[to] = true;
        }
    }

    function setDisableFaucet(bool shouldBeDisabled)
        external
        onlyRole(ADMIN_ROLE)
    {
        faucetDisabled = shouldBeDisabled;
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

    function setHolderLimit(uint256 _base, uint256 _decimals)
        external
        onlyRole(ADMIN_ROLE)
    {
        holderLimit = _base * 10**_decimals;
    }

    function setDripAmount(uint256 _dripbase, uint256 _decimals)
        external
        onlyRole(ADMIN_ROLE)
    {
        decimals = _decimals;
        dripBase = _dripbase;
        dripAmount = _dripbase * 10**_decimals;
    }

    function clearTimeoutForAddress(address forWhom)
        external
        onlyRole(ADMIN_ROLE)
    {
        _timeouts[forWhom] = 0;
    }

    function drain(address payable to) external onlyOwner {
        to.transfer(address(this).balance);
    }
}
