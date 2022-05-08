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
    uint256 public decimals;
    uint256 public timeout;
    bool public faucetDisabled;
    bool public singleUse;
    uint256 public holderLimit;
    bool public useHolderLimit;

    mapping(address => bool) _hasUsedFaucet;
    mapping(address => uint256) _timeouts;

    event ReceivedDeposit(address, uint256);
    event Dripped(address, string, uint256);

    modifier meetsFaucetRequirements(address to) {
        require(!faucetDisabled, 'FAUCET_DISABLED');
        require(address(this).balance >= dripAmount, 'FAUCET_DRY');

        if (singleUse) {
            require(!_hasUsedFaucet[to], 'SINGLE_USE');
        }

        require(to.balance >= holderLimit, 'HOLDER_LIMIT');

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

    function setHolderLimit(uint256 limit) external onlyRole(ADMIN_ROLE) {
        holderLimit = limit * 10**18;
    }

    function setDripAmount(uint256 amount, uint256 _decimals)
        external
        onlyRole(ADMIN_ROLE)
    {
        decimals = _decimals;
        dripAmount = amount * 10**_decimals;
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
