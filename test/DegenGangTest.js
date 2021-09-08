const DegenGang = artifacts.require('DegenGang');
const DegenGangABI = require('./abis/DegenGang.json');
const truffleAssert = require('truffle-assertions');
const BigNumber = require('bignumber.js');

const {
  callMethod
}  =  require('./utils/utils');

contract("DegenGang", async (accounts) => {
  const deployer = accounts[0];
  const defaultValue = '100000000000000000';
  const twoETHValue = '2000000000000000000';
  const threeETHValue = '3000000000000000000';
  const baseNFTURI = 'https://dengengang.io/api/image/';
  
  beforeEach(async () => {
    // Create Degen-ERC721 Instance
    this.DEGGNInstance = await DegenGang.new(
      accounts[4],  // Client
      accounts[5],  // Dev
      accounts[6],  // Member A
      accounts[7],  // Member B
      accounts[8],  // Giveaway
      { from: deployer }
    );
    // Create Degen-ERC721 Contract
    this.DEGGN = await new web3.eth.Contract(DegenGangABI.abi, this.DEGGNInstance.address);
  });
  
  describe ('Test - Total Sale Element', async() => {
    it ('Check Total Sale Element', async() => {
      // Get Initial Total Sale Element
      const totalSaleElement = await callMethod(this.DEGGN.methods.totalSaleElement, []);
      // Check Total Sale Element
      assert.equal(totalSaleElement, '7000');
    });
  });

  describe ('Test - Mint Price', async() => {
    it ('Check Mint Price', async() => {
      // Get Initial Mint Price
      const mintPrice = await callMethod(this.DEGGN.methods.mintPrice, []);
      // Check Mint Price
      assert.equal(mintPrice, '60000000000000000');
    });
  });

  describe ('Test - Private Max By Mint', async() => {
    it ('Check Max By Mint', async() => {
      // Get Initial Max By Mint
      const maxPrivateSaleMintQuantity = await callMethod(this.DEGGN.methods.maxPrivateSaleMintQuantity, []);
      // Check Max By Mint
      assert.equal(maxPrivateSaleMintQuantity, '3');
    });
  });

  describe ('Test - Public Max By Mint', async() => {
    it ('Check Max By Mint', async() => {
      // Get Initial Max By Mint
      const maxPublicSaleMintQuantity = await callMethod(this.DEGGN.methods.maxPublicSaleMintQuantity, []);
      // Check Max By Mint
      assert.equal(maxPublicSaleMintQuantity, '30');
    });
  });

  describe ('Test - Sale Status', async() => {
    it ('Check Sale Status', async() => {
      // Get Initial Public Sale Status
      const publicSaleIsActive = await callMethod(this.DEGGN.methods.publicSaleIsActive, []);
      // Get Initial Public Sale Status
      const privateSaleIsActive = await callMethod(this.DEGGN.methods.privateSaleIsActive, []);
      // Check Sale Status
      assert.equal(publicSaleIsActive, false);
      assert.equal(privateSaleIsActive, false);
    });

    it ('Check Set Sale Status - no Owner call it', async() => {
      // Set Sale Status
      await truffleAssert.reverts(
        this.DEGGNInstance.setPublicSaleStatus(true, { from: accounts[1] }),
        "Ownable: caller is not the owner"
      );
      await truffleAssert.reverts(
        this.DEGGNInstance.setPrivateSaleStatus(true, { from: accounts[1] }),
        "Ownable: caller is not the owner"
      );
    });

    it ('Check Set Sale Status - Owner call it', async() => {
      // Set Public Sale Status
      await this.DEGGNInstance.setPublicSaleStatus(true, { from : deployer });
      // Get Public Sale Status
      const publicSaleIsActive = await callMethod(this.DEGGN.methods.publicSaleIsActive, []);
      // Check Public Sale Status
      assert.equal(publicSaleIsActive, true);

      // Set Private Sale Status
      await this.DEGGNInstance.setPrivateSaleStatus(true, { from : deployer });
      // Get Private Sale Status
      const privateSaleIsActive = await callMethod(this.DEGGN.methods.privateSaleIsActive, []);
      // Check Public Sale Status
      assert.equal(privateSaleIsActive, true);
    });
  });

  describe ('Test - Base URI', async() => {
    it ('Check Base URI', async() => {
      // Get Initial Base URI
      const baseURI = await callMethod(this.DEGGN.methods.baseURI, []);
      // Check Base URI
      assert.equal(baseURI, '');
    });

    it ('Check Set Base URI - no Owner call it', async() => {
      // Set Base URI
      await truffleAssert.reverts(
        this.DEGGNInstance.setBaseURI(baseNFTURI, { from: accounts[1] }),
        "Ownable: caller is not the owner"
      );
    });

    it ('Check Set Base URI - Owner call it', async() => {
      // Set Base URI
      await this.DEGGNInstance.setBaseURI(baseNFTURI, { from: deployer });
      // Get Base URI
      const baseURI = await callMethod(this.DEGGN.methods.baseURI, []);
      // Check Base URI
      assert.equal(baseURI, baseNFTURI);
    });
  });

  describe ('Test - Update White List', async() => {
    it ('Check White List - no Owner call it', async() => {
      // Set Base URI
      await truffleAssert.reverts(
        this.DEGGNInstance.updateWhiteList([accounts[5]], { from: accounts[1] }),
        "Ownable: caller is not the owner"
      );
    });

    it ('Update White List', async() => {
      const whiteUserList = [accounts[2], accounts[3], accounts[4]];

      // Set White List
      await this.DEGGNInstance.updateWhiteList(whiteUserList, { from: deployer });

      for (let i = 0; i < whiteUserList.length; i += 1) {
        const whiteUserInfo = await callMethod(this.DEGGN.methods.userWhiteList, [whiteUserList[i]]);
        
        assert.equal(whiteUserInfo, true);
      }
    });
  });

  describe ('Test - Mint DEGGN By User at Private Sale', async() => {
    beforeEach(async() => {
      // Set Base URI
      await this.DEGGNInstance.setBaseURI(baseNFTURI, { from: deployer });
    });

    it ('Check Client&Dev Address', async() => {
      // Get Client Address
      const clientAddress = await callMethod(this.DEGGN.methods.clientAddress, []);
      // Check Client Address
      assert.equal(clientAddress, accounts[4]);

      // Get Dev Address
      const devAddress = await callMethod(this.DEGGN.methods.devAddress, []);
      // Check Dev Address
      assert.equal(devAddress, accounts[5]);

      // Get MemberA Address
      const teamMemberA = await callMethod(this.DEGGN.methods.teamMemberA, []);
      // Check Dev Address
      assert.equal(teamMemberA, accounts[6]);

      // Get MemberB Address
      const teamMemberB = await callMethod(this.DEGGN.methods.teamMemberB, []);
      // Check Dev Address
      assert.equal(teamMemberB, accounts[7]);

      // Get Giveaway Address
      const giveawayAddress = await callMethod(this.DEGGN.methods.giveawayAddress, []);
      // Check Giveaway Address
      assert.equal(giveawayAddress, accounts[8]);
    });

    it ('Check Sale Is Active', async() => {
      // Mint DEGGN
      await truffleAssert.reverts(
        this.DEGGNInstance.privateMintByUser(3, { value: defaultValue, from: accounts[1] }),
        "Private Sale is not active"
      );
    });

    it ('Check White List To Mint', async() => {
      // Set Private Sale Status
      await this.DEGGNInstance.setPrivateSaleStatus(true, { from : deployer });

      await truffleAssert.reverts(
        this.DEGGNInstance.privateMintByUser(3, { value: twoETHValue, from: accounts[1] }),
        "You're not in white list"
      );
    });

    it ('Check Mint Quantity', async() => {
      // Set Private Sale Status
      await this.DEGGNInstance.setPrivateSaleStatus(true, { from : deployer });

      // Set White List
      await this.DEGGNInstance.updateWhiteList([accounts[1]], { from: deployer });

      await truffleAssert.reverts(
        this.DEGGNInstance.privateMintByUser(0, { value: twoETHValue, from: accounts[1] }),
        "Mint Quantity should be more than zero"
      );
    });

    it ('Check Exceeds Private Sale Amount', async() => {
      // Set Private Sale Status
      await this.DEGGNInstance.setPrivateSaleStatus(true, { from : deployer });

      // Set White List
      await this.DEGGNInstance.updateWhiteList([accounts[1]], { from: deployer });

      // Mint DEGGN
      await truffleAssert.reverts(
        this.DEGGNInstance.privateMintByUser(4, { value: defaultValue, from: accounts[1] }),
        "Exceeds Private Sale Amount"
      );
    });

    it ('Check Low Price To Mint', async() => {
      // Set Private Sale Status
      await this.DEGGNInstance.setPrivateSaleStatus(true, { from : deployer });

      // Set White List
      await this.DEGGNInstance.updateWhiteList([accounts[1]], { from: deployer });

      // Mint DEGGN
      await truffleAssert.reverts(
        this.DEGGNInstance.privateMintByUser(3, { value: defaultValue, from: accounts[1] }),
        'Low Price To Mint'
      );
    });

    it ('Check DEGGN Mint', async() => {
      // Set Private Sale Status
      await this.DEGGNInstance.setPrivateSaleStatus(true, { from : deployer });

      // Set White List
      await this.DEGGNInstance.updateWhiteList([accounts[1]], { from: deployer });

      // Mint 2 DEGGN
      await this.DEGGNInstance.privateMintByUser(2, { value: twoETHValue, from: accounts[1] });

      // Get Balance Of User
      const userBalance = await callMethod(this.DEGGN.methods.balanceOf, [accounts[1]]);

      // Check Balance
      assert.equal(userBalance, '2');

      // Get Token List Of Owner
      let tokenList = await callMethod(this.DEGGN.methods.getTokensOfOwner, [accounts[1]]);
      
      // Check Token URIs
      for (let i = 0; i < tokenList.length; i += 1) {
        // Get Token URI
        const tokenURI = await callMethod(this.DEGGN.methods.tokenURI, [tokenList[i]]);
        // Check Token URI
        assert.equal(`${baseNFTURI}${tokenList[i]}`, tokenURI);
      }

      // Check Owners
      for (let i = 0; i < tokenList.length; i += 1) {
        // Get Owner Of ID
        const owner = await callMethod(this.DEGGN.methods.ownerOf, [tokenList[i]]);
        // Check Owner
        assert.equal(owner, accounts[1]);
      }

      // Check Mint Again, Over 3 deggns totally
      await truffleAssert.reverts(
        this.DEGGNInstance.privateMintByUser(2, { value: twoETHValue, from: accounts[1] }),
        "Max Limit To Presale"
      );

      // Mint 1 DEGGN Again
      await this.DEGGNInstance.privateMintByUser(1, { value: defaultValue, from: accounts[1] });

      // Get Token List Of Owner
      tokenList = await callMethod(this.DEGGN.methods.getTokensOfOwner, [accounts[1]]);
      
      // Check Token URIs Again
      for (let i = 0; i < tokenList.length; i += 1) {
        // Get Token URI
        const tokenURI = await callMethod(this.DEGGN.methods.tokenURI, [tokenList[i]]);
        // Check Token URI
        assert.equal(`${baseNFTURI}${tokenList[i]}`, tokenURI);
      }

      const whiteUserInfo = await callMethod(this.DEGGN.methods.userWhiteList, [accounts[1]]);
      assert.equal(whiteUserInfo, true);

      // Check Total Supply
      const totalSupply = await callMethod(this.DEGGN.methods.totalSupply, []);
      assert.equal(totalSupply, '3');

      // Check Total Mint
      const totalMint = await callMethod(this.DEGGN.methods.totalMint, []);
      assert.equal(totalMint, '3');
    });

    it ('Check DEGGN Mint and TransferFrom', async() => {
      // Set Private Sale Status
      await this.DEGGNInstance.setPrivateSaleStatus(true, { from : deployer });

      // Set White List
      await this.DEGGNInstance.updateWhiteList([accounts[1]], { from: deployer });

      // Mint 3 DEGGN
      await this.DEGGNInstance.privateMintByUser(3, { value: twoETHValue, from: accounts[1] });

      // Get Balance Of User
      const userBalance = await callMethod(this.DEGGN.methods.balanceOf, [accounts[1]]);

      // Check Balance
      assert.equal(userBalance, '3');

      // TransferFrom One Item To Another User
      // Approve
      await this.DEGGNInstance.approve(accounts[0], '1', { from: accounts[1] });
      // Call SafeTransferFrom
      await this.DEGGNInstance.safeTransferFrom(
        accounts[1],
        accounts[2],
        '1',
        {
          from: accounts[0]
        }
      );

      // Check Balance
      const firstUserBalance = await callMethod(this.DEGGN.methods.balanceOf, [accounts[1]]);
      assert.equal(firstUserBalance, '2');
      const secondUserBalance = await callMethod(this.DEGGN.methods.balanceOf, [accounts[2]]);
      assert.equal(secondUserBalance, '1');

      // Check Owner Of Token
      // Get Owner Of ID
      const owner = await callMethod(this.DEGGN.methods.ownerOf, ['1']);
      // Check Owner
      assert.equal(owner, accounts[2]);      
    });
  });

  describe ('Test - Mint DEGGN By User At PublicSale', async() => {
    beforeEach(async() => {
      // Set Base URI
      await this.DEGGNInstance.setBaseURI(baseNFTURI, { from: deployer });
    });

    it ('Check Client&Dev Address', async() => {
      // Get Client Address
      const clientAddress = await callMethod(this.DEGGN.methods.clientAddress, []);
      // Check Client Address
      assert.equal(clientAddress, accounts[4]);

      // Get Dev Address
      const devAddress = await callMethod(this.DEGGN.methods.devAddress, []);
      // Check Dev Address
      assert.equal(devAddress, accounts[5]);

      // Get MemberA Address
      const teamMemberA = await callMethod(this.DEGGN.methods.teamMemberA, []);
      // Check Dev Address
      assert.equal(teamMemberA, accounts[6]);

      // Get MemberB Address
      const teamMemberB = await callMethod(this.DEGGN.methods.teamMemberB, []);
      // Check Dev Address
      assert.equal(teamMemberB, accounts[7]);

      // Get Giveaway Address
      const giveawayAddress = await callMethod(this.DEGGN.methods.giveawayAddress, []);
      // Check Giveaway Address
      assert.equal(giveawayAddress, accounts[8]);
    });

    it ('Check Sale Is Active', async() => {
      // Mint DEGGN
      await truffleAssert.reverts(
        this.DEGGNInstance.publicMintByUser(10, { value: defaultValue, from: accounts[1] }),
        "Public Sale is not active"
      );
    });

    it ('Check Mint Quantity', async() => {
      // Set Private Sale Status
      await this.DEGGNInstance.setPublicSaleStatus(true, { from : deployer });

      await truffleAssert.reverts(
        this.DEGGNInstance.publicMintByUser(0, { value: twoETHValue, from: accounts[1] }),
        "Mint Quantity should be more than zero"
      );
    });   

    it ('Check Exceeds Public Sale Amount', async() => {
      // Set Public Sale Status
      await this.DEGGNInstance.setPublicSaleStatus(true, { from : deployer });

      // Mint DEGGN
      await truffleAssert.reverts(
        this.DEGGNInstance.publicMintByUser(31, { value: defaultValue, from: accounts[1] }),
        'Exceeds Public Sale Amount'
      );
    });

    it ('Check Low Price To Mint', async() => {
      // Set Public Sale Status
      await this.DEGGNInstance.setPublicSaleStatus(true, { from : deployer });

      // Mint DEGGN
      await truffleAssert.reverts(
        this.DEGGNInstance.publicMintByUser(20, { value: defaultValue, from: accounts[1] }),
        'Low Price To Mint'
      );
    });

    it ('Check DEGGN Mint', async() => {
      // Set Public Sale Status
      await this.DEGGNInstance.setPublicSaleStatus(true, { from : deployer });

      // Mint DEGGN
      await this.DEGGNInstance.publicMintByUser(10, { value: twoETHValue, from: accounts[1] });

      // Get Balance Of User
      const userBalance = await callMethod(this.DEGGN.methods.balanceOf, [accounts[1]]);

      // Check Balance
      assert.equal(userBalance, '10');

      // Get Token List Of Owner
      const tokenList = await callMethod(this.DEGGN.methods.getTokensOfOwner, [accounts[1]]);
      
      // Check Token URIs
      for (let i = 0; i < tokenList.length; i += 1) {
        // Get Token URI
        const tokenURI = await callMethod(this.DEGGN.methods.tokenURI, [tokenList[i]]);
        // Check Token URI
        assert.equal(`${baseNFTURI}${tokenList[i]}`, tokenURI);
      }

      // Check Owners
      for (let i = 0; i < tokenList.length; i += 1) {
        // Get Owner Of ID
        const owner = await callMethod(this.DEGGN.methods.ownerOf, [tokenList[i]]);
        // Check Owner
        assert.equal(owner, accounts[1]);
      }
    });

    it ('Check DEGGN Mint and Total Supply&Mint', async() => {
      // Set Public Sale Status
      await this.DEGGNInstance.setPublicSaleStatus(true, { from : deployer });

      // Mint DEGGN
      await this.DEGGNInstance.publicMintByUser(30, { value: twoETHValue, from: accounts[1] });

      // Get Balance Of User
      const userBalance = await callMethod(this.DEGGN.methods.balanceOf, [accounts[1]]);

      // Check Balance
      assert.equal(userBalance, '30');

      // Check Total Supply
      const totalSupply = await callMethod(this.DEGGN.methods.totalSupply, []);
      assert.equal(totalSupply, '30');

      // Check Total Mint
      const totalMint = await callMethod(this.DEGGN.methods.totalMint, []);
      assert.equal(totalMint, '30');
    });

    it ('Check DEGGN Mint Twice', async() => {
      // Set Public Sale Status
      await this.DEGGNInstance.setPublicSaleStatus(true, { from : deployer });

      // Mint DEGGN From User1
      await this.DEGGNInstance.publicMintByUser(30, { value: twoETHValue, from: accounts[1] });

      // Get Balance Of User
      const userBalance = await callMethod(this.DEGGN.methods.balanceOf, [accounts[1]]);

      // Check Balance
      assert.equal(userBalance, '30');

      await this.DEGGNInstance.publicMintByUser(20, { value: twoETHValue, from: accounts[2] });

      // Get Token List Of Owner
      const tokenList = await callMethod(this.DEGGN.methods.getTokensOfOwner, [accounts[2]]);

      // Check Token URIs Of User2
      for (let i = 0; i < tokenList.length; i += 1) {
        // Get Token URI
        const tokenURI = await callMethod(this.DEGGN.methods.tokenURI, [tokenList[i]]);
        // Check Token URI
        assert.equal(`${baseNFTURI}${i + 30}`, tokenURI);
      }

      // Check Owners Of User2
      for (let i = 0; i < tokenList.length; i += 1) {
        // Get Owner Of ID
        const owner = await callMethod(this.DEGGN.methods.ownerOf, [tokenList[i]]);
        // Check Owner
        assert.equal(owner, accounts[2]);
      }

      // Check Total Supply
      const totalSupply = await callMethod(this.DEGGN.methods.totalSupply, []);
      assert.equal(totalSupply, '50');

      // Check Total Mint
      const totalMint = await callMethod(this.DEGGN.methods.totalMint, []);
      assert.equal(totalMint, '50');    
    });

    it ('Check DEGGN Mint and TransferFrom', async() => {
      // Set Public Sale Status
      await this.DEGGNInstance.setPublicSaleStatus(true, { from : deployer });

      // Mint DEGGN
      await this.DEGGNInstance.publicMintByUser(30, { value: twoETHValue, from: accounts[1] });

      // Get Balance Of User
      const userBalance = await callMethod(this.DEGGN.methods.balanceOf, [accounts[1]]);

      // Check Balance
      assert.equal(userBalance, '30');

      // TransferFrom One Item To Another User
      // Approve
      await this.DEGGNInstance.approve(accounts[0], '10', { from: accounts[1] });
      // Call SafeTransferFrom
      await this.DEGGNInstance.safeTransferFrom(
        accounts[1],
        accounts[2],
        '10',
        {
          from: accounts[0]
        }
      );

      // Check Balance
      const firstUserBalance = await callMethod(this.DEGGN.methods.balanceOf, [accounts[1]]);
      assert.equal(firstUserBalance, '29');
      const secondUserBalance = await callMethod(this.DEGGN.methods.balanceOf, [accounts[2]]);
      assert.equal(secondUserBalance, '1');

      // Check Owner Of Token
      // Get Owner Of ID
      const owner = await callMethod(this.DEGGN.methods.ownerOf, ['10']);
      // Check Owner
      assert.equal(owner, accounts[2]);      
    });
  });

  describe ('Test - Mint DEGGN By Admin', async() => {
    beforeEach(async() => {
      // Set Base URI
      await this.DEGGNInstance.setBaseURI(baseNFTURI, { from: deployer });
    });

    it ('Check Client&Dev Address', async() => {
      // Get Client Address
      const clientAddress = await callMethod(this.DEGGN.methods.clientAddress, []);
      // Check Client Address
      assert.equal(clientAddress, accounts[4]);

      // Get Dev Address
      const devAddress = await callMethod(this.DEGGN.methods.devAddress, []);
      // Check Dev Address
      assert.equal(devAddress, accounts[5]);

      // Get MemberA Address
      const teamMemberA = await callMethod(this.DEGGN.methods.teamMemberA, []);
      // Check Dev Address
      assert.equal(teamMemberA, accounts[6]);

      // Get MemberB Address
      const teamMemberB = await callMethod(this.DEGGN.methods.teamMemberB, []);
      // Check Dev Address
      assert.equal(teamMemberB, accounts[7]);

      // Get Giveaway Address
      const giveawayAddress = await callMethod(this.DEGGN.methods.giveawayAddress, []);
      // Check Giveaway Address
      assert.equal(giveawayAddress, accounts[8]);
    });

    it ('Check DEGGN Mint and Admin Mint', async() => {
      // Set Public Sale Status
      await this.DEGGNInstance.setPublicSaleStatus(true, { from : deployer });

      // Mint DEGGN From User1
      await this.DEGGNInstance.publicMintByUser(30, { value: twoETHValue, from: accounts[1] });

      // Get Balance Of User
      const userBalance = await callMethod(this.DEGGN.methods.balanceOf, [accounts[1]]);

      // Check Balance
      assert.equal(userBalance, '30');

      // Check call from wrong owner
      await truffleAssert.reverts(
        this.DEGGNInstance.mintByOwner(accounts[2], 10, { from: accounts[1] }),
        "Ownable: caller is not the owner"
      );

      // Admin Mint
      await this.DEGGNInstance.mintByOwner(accounts[2], 10, { from: deployer });

      await this.DEGGNInstance.publicMintByUser(10, { value: twoETHValue, from: accounts[2] });

      // Get Token List Of Owner
      const tokenList = await callMethod(this.DEGGN.methods.getTokensOfOwner, [accounts[2]]);

      // Check Token URIs Of User2
      for (let i = 0; i < tokenList.length; i += 1) {
        // Get Token URI
        const tokenURI = await callMethod(this.DEGGN.methods.tokenURI, [tokenList[i]]);
        // Check Token URI
        assert.equal(`${baseNFTURI}${i + 30}`, tokenURI);
      }

      // Check Owners Of User2
      for (let i = 0; i < tokenList.length; i += 1) {
        // Get Owner Of ID
        const owner = await callMethod(this.DEGGN.methods.ownerOf, [tokenList[i]]);
        // Check Owner
        assert.equal(owner, accounts[2]);
      }

      // Check Total Supply
      const totalSupply = await callMethod(this.DEGGN.methods.totalSupply, []);
      assert.equal(totalSupply, '50');

      // Check Total Mint
      const totalMint = await callMethod(this.DEGGN.methods.totalMint, []);
      assert.equal(totalMint, '50');
    });

    it ('Check Batch Admin Mint', async() => {
      const mintAddressList = [accounts[1], accounts[2], accounts[3], accounts[4], accounts[5]];
      const quantityList = ['10', '5', '5', '5', '5'];

      // Check call from wrong owner
      await truffleAssert.reverts(
        this.DEGGNInstance.batchMintByOwner(mintAddressList, quantityList, { from: accounts[1] }),
        "Ownable: caller is not the owner"
      );

      await this.DEGGNInstance.batchMintByOwner(mintAddressList, quantityList, { from: deployer });

      // Check Total Supply
      const totalSupply = await callMethod(this.DEGGN.methods.totalSupply, []);
      assert.equal(totalSupply, '30');

      // Check Total Mint
      const totalMint = await callMethod(this.DEGGN.methods.totalMint, []);
      assert.equal(totalMint, '30');

      let previousSum = 0;
      for (let i = 0; i < mintAddressList; i += 1) {
        // Check Balance
        const userBalance = await callMethod(this.DEGGN.methods.balanceOf, [mintAddressList[i]]);
        assert.equal(userBalance, quantityList[i]);

        previousSum += i > 0 ? parseInt(quantityList[i - 1]) : 0;

        for (let j = 0; j < parseInt(quantityList[i]); j += 1) {
          // Get Owner Of ID
          const owner = await callMethod(this.DEGGN.methods.ownerOf, [previousSum + j]);
          // Check Owner
          assert.equal(owner, mintAddressList[i]);
        }
      }
    });

    it ('Check Withdraw After Mint', async() => {
      // Set Public Sale Status
      await this.DEGGNInstance.setPublicSaleStatus(true, { from : deployer });

      // Mint DEGGN From User1
      await this.DEGGNInstance.publicMintByUser(30, { value: threeETHValue, from: accounts[1] });

      // Get Balance Of User
      const userBalance = await callMethod(this.DEGGN.methods.balanceOf, [accounts[1]]);

      // Check Balance
      assert.equal(userBalance, '30');

      // Get Contract Balance
      const contractBalance = new BigNumber(await web3.eth.getBalance(this.DEGGNInstance.address));
      const clientAmount = contractBalance.multipliedBy(5500).dividedBy(10000);
      const devAmount = contractBalance.multipliedBy(2500).dividedBy(10000);
      const memberAAmount = contractBalance.multipliedBy(500).dividedBy(10000);
      const memberBAmount = contractBalance.multipliedBy(1000).dividedBy(10000);
      const giveawayAmount = contractBalance.minus(clientAmount).minus(devAmount).minus(memberAAmount).minus(memberBAmount);

      // Call Withdraw
      await truffleAssert.reverts(
        this.DEGGNInstance.withdrawAll({ from: accounts[1] }),
        'Ownable: caller is not the owner'
      );

      // Get Admin Account
      const clientAddress = await callMethod(this.DEGGN.methods.clientAddress, []);
      const oldAdminBalance = new BigNumber(await web3.eth.getBalance(clientAddress));

      // Get Dev Account
      const devAddress = await callMethod(this.DEGGN.methods.devAddress, []);
      const oldDevBalance = new BigNumber(await web3.eth.getBalance(devAddress));

      // Get MemberA Account
      const memberAAddress = await callMethod(this.DEGGN.methods.teamMemberA, []);
      const oldMemberABalance = new BigNumber(await web3.eth.getBalance(memberAAddress));

      // Get MemberB Account
      const memberBAddress = await callMethod(this.DEGGN.methods.teamMemberB, []);
      const oldMemberBBalance = new BigNumber(await web3.eth.getBalance(memberBAddress));

      // Get Giveaway Account
      const giveawayAddress = await callMethod(this.DEGGN.methods.giveawayAddress, []);
      const oldGiveawayBalance = new BigNumber(await web3.eth.getBalance(giveawayAddress));

      // Call Withdraw All
      await this.DEGGNInstance.withdrawAll({ from: deployer });

      // Get Update Balance
      const newAdminBalance = new BigNumber(await web3.eth.getBalance(clientAddress));
      const newDevBalance = new BigNumber(await web3.eth.getBalance(devAddress));
      const newMemberABalance = new BigNumber(await web3.eth.getBalance(memberAAddress));
      const newMemberBBalance = new BigNumber(await web3.eth.getBalance(memberBAddress));
      const newGiveawayBalance = new BigNumber(await web3.eth.getBalance(giveawayAddress));

      // Check Balance
      assert.equal(newAdminBalance.minus(oldAdminBalance).toFixed(), clientAmount.toFixed());
      assert.equal(newDevBalance.minus(oldDevBalance).toFixed(), devAmount.toFixed());
      assert.equal(newMemberABalance.minus(oldMemberABalance).toFixed(), memberAAmount.toFixed());
      assert.equal(newMemberBBalance.minus(oldMemberBBalance).toFixed(), memberBAmount.toFixed());
      assert.equal(newGiveawayBalance.minus(oldGiveawayBalance).toFixed(), giveawayAmount.toFixed());
    });
  });
});
