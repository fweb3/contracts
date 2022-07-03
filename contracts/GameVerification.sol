// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
// import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import 'hardhat/console.sol';
// see if user has already won - they have a trophy

interface TrophyNFT {
  function balanceOf(address account) external returns (uint256);
  function isWinner(address account) external returns (bool);
  function verifyPlayer(address account) external;
  function mint() external;
}


contract GameVerification is Ownable, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    TrophyNFT private _trophyContract;
    IERC20 private _fweb3Token;

    event AllowedToMintTrophy(address indexed player);

    constructor(IERC20 fweb3Token, address trophyAddress) {
      _fweb3Token = fweb3Token;
      _trophyContract = TrophyNFT(trophyAddress);
      _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
      _setupRole(ADMIN_ROLE, msg.sender);
    }

    function allowToMintTrophy(address player) external {
      _trophyContract.verifyPlayer(player);
      emit AllowedToMintTrophy(player);
    }

    function hasTrophyAlready(address player) external returns (uint256) {
      uint256 hasTrophy = _trophyContract.balanceOf(player);
      return hasTrophy;
    }

    // struct playerDetails {
    //     bool isSeekingVerification;
    //     bool hasBeenVerifiedToWin;
    //     bool hasWon;
    //     address judgeApprovedBy;
    // }
    // mapping(address => playerDetails) private players;

    // event PlayerSeeksVerification(address indexed _player);
    // event PlayerVerifiedToWin(address indexed _player, address indexed _judge);
    // event PlayerWon(address indexed player);

    // constructor(IERC20 token) {
    //     _token = token;
    // }

    // modifier onlyJudge() {
    //     require(isJudge(msg.sender), 'not judge');
    //     _;
    // }

    // function isWinner(address player) external view returns (bool) {
    //     return players[player].hasWon;
    // }

    // function isJudge(address judge) public view returns (bool) {
    //     if (judge == owner()) {
    //         return true;
    //     }
    //     bool contains = false;
    //     for (uint256 i = 0; i < judges.length; i++) {
    //         if (judge == judges[i]) {
    //             contains = true;
    //         }
    //     }
    //     return contains;
    // }

    // function hasTokens(address player) internal view returns (bool) {
    //     return _token.balanceOf(player) >= 100 * 10**18;
    // }

    // function hasBeenVerifiedToWin(address player) internal view returns (bool) {
    //     return players[player].hasBeenVerifiedToWin;
    // }

    // function hasNotWonBefore(address player) internal view returns (bool) {
    //     return !players[player].hasWon;
    // }

    // function seekVerification() external {
    //     require(hasTokens(msg.sender), 'not enough tokens');
    //     players[msg.sender].isSeekingVerification = true;
    //     emit PlayerSeeksVerification(msg.sender);
    // }

    // function win() external {
    //     require(hasTokens(msg.sender), 'not enough tokens');
    //     require(hasBeenVerifiedToWin(msg.sender), 'not verified');
    //     require(hasNotWonBefore(msg.sender), 'has won');
    //     _token.transfer(msg.sender, 1000 * 10**18);
    //     players[msg.sender].hasWon = true;
    //     emit PlayerWon(msg.sender);
    // }

    // function verifyPlayer(address player) external onlyJudge {
    //     players[player].hasBeenVerifiedToWin = true;
    //     removePlayerFromSeekingVerification(player);
    //     emit PlayerVerifiedToWin(player, msg.sender);
    // }

    // function addJudge(address judge) external onlyOwner {
    //     require(!isJudge(judge), 'already judge');
    //     judges.push(judge);
    // }

    // function removeJudge(address judge) external onlyOwner {
    //     for (uint256 i = 0; i < judges.length; i++) {
    //         if (judge == judges[i]) {
    //             delete judges[i];
    //         }
    //     }
    // }

    // function getJudges() external view returns (address[] memory) {
    //     return judges;
    // }

    // function removePlayerFromSeekingVerification(address player) internal {
    //     players[player].isSeekingVerification = false;
    // }

    // function getPlayer(address player)
    //     external
    //     view
    //     onlyJudge
    //     returns (
    //         bool isSeekingVerification,
    //         bool verifiedToWin,
    //         bool hasWon,
    //         address judgeApprovedBy
    //     )
    // {
    //     return (
    //         players[player].isSeekingVerification,
    //         players[player].hasBeenVerifiedToWin,
    //         players[player].hasWon,
    //         players[player].judgeApprovedBy
    //     );
    // }
}
