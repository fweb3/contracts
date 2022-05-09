// SPDX-License-Identifier: UNLICENSED
/**
 * @title Fweb3TokenFaucet
 * @dev ContractDescription
 * @custom:dev-run-script contracts/Fweb3TokenFaucet.sol
 */
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import './FaucetBase.sol';

contract Fweb3TokenFaucet is FaucetBase {
    ERC20 public fweb3Token;

    event ReceivedFweb3Deposit(address, uint256);

    constructor(
        ERC20 _fweb3Token,
        uint256 _dripBase,
        uint256 _decimals,
        uint256 _timeout,
        bool _singleUse,
        uint256 _holderLimitFweb3
    ) FaucetBase() {
        fweb3Token = _fweb3Token;
        dripAmount = _dripBase * 10**_decimals;
        dripBase = _dripBase;
        decimals = _decimals;
        timeout = _timeout;
        singleUse = _singleUse;
        holderLimit = _holderLimitFweb3 * 10**18;
    }

    function drip(address payable to)
        external
        meetsFaucetRequirements(to)
        onlyRole(ADMIN_ROLE)
    {
        require(fweb3Token.balanceOf(address(this)) >= dripAmount, 'FWEB3_DRY');

        if (holderLimit != 0) {
            require(fweb3Token.balanceOf(to) <= holderLimit, 'FWEB3_WALLET_LIMIT');
        }

        bool success = fweb3Token.transfer(to, dripAmount);

        require(success, 'TX_FAILURE');

        updateAddressState(to);

        emit Dripped(msg.sender, 'FWEB3', dripAmount);
    }

    function drainFweb3(address payable to) external onlyOwner {
        uint256 balance = fweb3Token.balanceOf(address(this));
        bool success = fweb3Token.transfer(to, balance);
        require(success, 'TX_FAILURE');
    }
}
