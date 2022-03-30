// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
// import 'hardhat/console.sol';

contract Fweb3TokenFaucet {
    ERC20 private erc20DripToken;
    uint256 minERC20ToUseEthFaucet;
    uint256 private erc20DripAmount;
    uint256 private ethDripAmount;
    address private owner;
    address[] private admins;
    uint256 private timeout;
    mapping(address => uint256) private timeouts;
    mapping(address => bool) private disabledAccount;
    event Received(address, uint256);

    event SentETHTokens(address indexed account, uint256 timestamp);
    event SentERC20Tokens(address indexed account, uint256 timestamp);

    modifier ownerOnly() {
        require(msg.sender == owner, 'unauthorized');
        _;
    }

    constructor(
        uint256 _ethDripAmount,
        address _erc20DripToken,
        uint256 _minERC20ToUseEthFaucet,
        uint256 _erc20DripAmount,
        uint256 _timeout
    ) {
        erc20DripToken = ERC20(_erc20DripToken);
        minERC20ToUseEthFaucet = _minERC20ToUseEthFaucet;
        owner = msg.sender;
        timeout = _timeout;
        erc20DripAmount =
            _erc20DripAmount *
            10**ERC20(_erc20DripToken).decimals();
        ethDripAmount = _ethDripAmount * 10**ERC20(_erc20DripToken).decimals();
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    function dripEth(address payable _to) external {
        _isAllowedToDripEth(_to);
        (bool success, ) = _to.call{value: ethDripAmount}('');
        require(success, 'Failed to send Ether');
        timeouts[_to] = block.timestamp;
        emit SentETHTokens(_to, block.timestamp);
    }

    function depositERC20(uint256 _erc20Amount) external {
        erc20DripToken.transferFrom(msg.sender, address(this), _erc20Amount);
    }

    function dripERC20(address _to) external {
        _contractHasEnoughERC20();
        bool success = erc20DripToken.transfer(_to, erc20DripAmount);
        require(success, 'Failed to send erc20');
        emit SentERC20Tokens(_to, block.timestamp);
    }

    // Validity

    function _isAllowedToDripEth(address _to) private view {
        _isTimedOut(_to);
        _hasMinERC20Tokens(_to);
        _contractHasEnoughEth();
    }

    function _hasMinERC20Tokens(address _to) private view {
        require(
            erc20DripToken.balanceOf(_to) >= minERC20ToUseEthFaucet,
            'Not enough required tokens for faucet'
        );
    }

    function _contractHasEnoughEth() private view {
        require(
            address(this).balance >= ethDripAmount,
            'Insufficient Faucet Funds'
        );
    }

    function _isTimedOut(address _to) private view {
        require(
            timeouts[_to] <= block.timestamp - (timeout * 1 minutes),
            'Too Early for Another Faucet Drop'
        );
    }

    function _contractHasEnoughERC20() private view {
        uint256 balance = erc20DripToken.balanceOf(address(this));
        require(balance <= erc20DripAmount, 'Insufficient Faucet Funds');
    }

    // Getters / Setters

    function getEthBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getEthDripAmount() public view ownerOnly returns (uint256) {
        return ethDripAmount;
    }

    function setEthDripAmount(uint256 amount) public ownerOnly {
        ethDripAmount = amount;
    }

    function getERC20Balance() external view returns (uint256) {
        return erc20DripToken.balanceOf(address(this));
    }

    function getERC20DripAmount() public view ownerOnly returns (uint256) {
        return erc20DripAmount;
    }

    function setERC20DripAmount(uint256 amount) public ownerOnly {
        erc20DripAmount = amount;
    }
}
