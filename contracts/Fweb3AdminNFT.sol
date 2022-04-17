// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import '@openzeppelin/contracts/utils/Counters.sol';
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract Fweb3AdminNFT is Ownable, ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _adminCount;

    constructor() ERC721("Fweb3Admin", "FWEB3ADMIN") {}

    function mint(address newAdmin) external onlyOwner {
      string memory payload = _buildSvg();
      _adminCount.increment();
      _safeMint(newAdmin, _adminCount.current());
      _setTokenURI(_adminCount.current(), payload);
    }

    function _buildSvg()
        internal
        pure
        returns (string memory)
    {
        string memory svg = string(
            abi.encodePacked("<svg width='157' height='150' viewBox='0 0 157 150' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M78.5 0L97.0224 57.0061H156.962L108.47 92.2378L126.992 149.244L78.5 114.012L30.0077 149.244L48.5301 92.2378L0.0378342 57.0061H59.9776L78.5 0Z' fill='#F5E659'/></svg>")
        );

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Admin NFT", "description": "Fweb3 permissions nft", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(svg)),
                        '"}'
                    )
                )
            )
        );
        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        return output;
    }
}
