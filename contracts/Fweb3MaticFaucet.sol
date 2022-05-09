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
import './FaucetBase.sol';

contract Fweb3MaticFaucet is FaucetBase {
    IERC20 public fweb3TokenAddress;
    uint256 public minFweb3Required;
    uint256 public minFweb3RequiredDecimals;

    constructor(
        uint256 _dripBase,
        uint256 _decimals,
        IERC20 _fweb3TokenAddress,
        uint256 _timout,
        bool _singleUse,
        uint256 _minFweb3Required,
        uint256 _minFweb3TokenRequiredDecimals,
        uint256 _holderLimit
    ) FaucetBase() {
        dripBase = _dripBase;
        dripAmount = _dripBase * 10**_decimals;
        decimals = _decimals;
        timeout = _timout;
        singleUse = _singleUse;
        fweb3TokenAddress = _fweb3TokenAddress;
        minFweb3RequiredDecimals = _minFweb3TokenRequiredDecimals;
        minFweb3Required =
            _minFweb3Required *
            10**_minFweb3TokenRequiredDecimals;
        holderLimit = _holderLimit;
    }

    function drip(address payable to)
        external
        meetsFaucetRequirements(to)
        onlyRole(ADMIN_ROLE)
    {
        require(address(this).balance >= dripAmount, 'FAUCET_DRY');

        require(
            fweb3TokenAddress.balanceOf(to) >= minFweb3Required,
            'MISSING_FWEB3_TOKENS'
        );

        if (holderLimit != 0) {
            require(to.balance <= holderLimit, 'HOLDER_LIMIT');
        }

        (bool success, ) = to.call{value: dripAmount}('');

        require(success, 'TX_FAILURE');

        updateAddressState(to);

        emit Dripped(msg.sender, 'MATIC', dripAmount);
    }

    function setMinErc20Required(uint256 min, uint256 decimals)
        external
        onlyRole(ADMIN_ROLE)
    {
        minFweb3Required = min * 10**decimals;
    }
}
