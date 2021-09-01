// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

import "./Ownable.sol";
import "./ERC721.sol";
import "./SafeMath.sol";
import "./Counters.sol";

/**
 * @title DegenGang Contract
 * @dev Extends ERC721 Non-Fungible Token Standard basic implementation
 */
contract DegenGang is ERC721, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdTracker;

    uint256 public totalSaleElement;
    uint256 public mintPrice;
    uint256 public maxByMint;

    address public clientAddress;    
    address public giveawayAddress;
    address public devAddress;
    address public teamMemberA;
    address public teamMemberB;

    bool public saleIsActive;

    event CreateDeggn(
        address indexed minter,
        uint256 indexed id
    );

    modifier checkSaleIsActive {
        require(saleIsActive == true, "Sale is not active");
        _;
    }

    constructor(
        address client,
        address dev,
        address memberA,
        address memberB,
        address giveaway
    ) ERC721("Degen Gang", "DEGGN") {
        totalSaleElement = 7000; // 7K
        mintPrice = 6 * 10 ** 16; // 0.06 ETH
        saleIsActive = false;
        maxByMint = 30;

        clientAddress = client;
        devAddress = dev;
        teamMemberA = memberA;
        teamMemberB = memberB;
        giveawayAddress = giveaway;
    }

    /**
     * Set Total Sale Element
     */
    function setTotalSaleElement(uint256 saleElement) external onlyOwner {
        totalSaleElement = saleElement;
    }

    /**
     * Set Mint Price
     */
    function setMintPrice(uint256 newMintPrice) external onlyOwner {
        mintPrice = newMintPrice;
    }

    /**
     * Set Max By Mint
     */
    function setMaxByMint(uint256 newMaxByMint) external onlyOwner {
        maxByMint = newMaxByMint;
    }

    /**
     * Set Sale Status
     */
    function setSaleStatus(bool saleStatus) external onlyOwner {
        saleIsActive = saleStatus;
    }

    /**
     * Set Base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _setBaseURI(baseURI);
    }

    /**
     * Get Total Supply
     */
    function _totalSupply() internal view returns (uint) {
        return _tokenIdTracker.current();
    }

    /**
     * Get Total Mint
     */
    function totalMint() public view returns (uint) {
        return _totalSupply();
    }
    
    /**
     * Check if certain token id is exists.
     */
    function exists(uint256 _tokenId) public view returns (bool) {
        return _exists(_tokenId);
    }

    /**
     * Get Tokens Of Owner
     */
    function getTokensOfOwner(address _owner) public view returns (uint256 [] memory) {
        uint256 tokenCount = balanceOf(_owner);

        uint256[] memory tokenIdList = new uint256[](tokenCount);
        for (uint256 i = 0; i < tokenCount; i++) {
            tokenIdList[i] = tokenOfOwnerByIndex(_owner, i);
        }

        return tokenIdList;
    }

    /**
     * Mint An Element
     */
    function _mintAnElement(address _to) internal {
        uint256 id = _totalSupply();

        _tokenIdTracker.increment();
        _safeMint(_to, id);

        emit CreateDeggn(_to, id);   
    }

    /**
     * Mint DEGGN By User
     */
    function mintByUser(address _to, uint256 _amount) public payable checkSaleIsActive {
        uint256 totalSupply = _totalSupply();

        require(totalSupply <= totalSaleElement, "Presale End");
        require(totalSupply + _amount <= totalSaleElement, "Max Limit To Presale");
        require(_amount <= maxByMint, "Exceeds Amount");
        require(mintPrice.mul(_amount) <= msg.value, "Low Price To Mint");

        for (uint256 i = 0; i < _amount; i += 1) {
            _mintAnElement(_to);
        }
    }

    /**
     * Mint DEGGN By Owner
     */
    function mintByOwner(address _to, uint256 _amount) external onlyOwner {
        uint256 totalSupply = _totalSupply();

        require(totalSupply <= totalSaleElement, "Presale End");
        require(totalSupply + _amount <= totalSaleElement, "Max Limit To Presale");

        for (uint256 i = 0; i < _amount; i += 1) {
            _mintAnElement(_to);
        }
    }

    /**
     * Withdraw
     */
    function withdrawAll() external onlyOwner {
        uint256 totalBalance = address(this).balance;
        uint256 restAmount = totalBalance;

        uint256 clientAmount = totalBalance.mul(5000).div(10000); // 50%
        restAmount = restAmount.sub(clientAmount);

        uint256 devAmount = totalBalance.mul(3000).div(10000); // 30%
        restAmount = restAmount.sub(devAmount);

        uint256 memberAAmount = totalBalance.mul(500).div(10000); // 5%
        restAmount = restAmount.sub(memberAAmount);

        uint256 memberBAmount = totalBalance.mul(1000).div(10000); // 10%
        restAmount = restAmount.sub(memberBAmount);

        uint256 giveawayAmount = restAmount;    // 5%

        // Withdraw To Client
        (bool withdrawClient, ) = clientAddress.call{value: clientAmount}("");
        require(withdrawClient, "Withdraw Failed To Client.");

        // Withdraw To Dev
        (bool withdrawDev, ) = devAddress.call{value: devAmount}("");
        require(withdrawDev, "Withdraw Failed To Dev");

        // Withdraw To MemberA
        (bool withdrawMemberA, ) = teamMemberA.call{value: memberAAmount}("");
        require(withdrawMemberA, "Withdraw Failed To Member A");

        // Withdraw To MemberB
        (bool withdrawMemberB, ) = teamMemberB.call{value: memberBAmount}("");
        require(withdrawMemberB, "Withdraw Failed To Member B");

        // Withdraw To Giveaway
        (bool withdrawGiveaway, ) = giveawayAddress.call{value: giveawayAmount}("");
        require(withdrawGiveaway, "Withdraw Failed To Giveaway");
    }
}