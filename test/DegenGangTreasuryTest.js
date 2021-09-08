const DegenGangTreasury = artifacts.require('DegenGangTreasury');
const DegenGangTreasuryABI = require('./abis/DegenGangTreasury.json');
const truffleAssert = require('truffle-assertions');
const BigNumber = require('bignumber.js');

const {
  callMethod
}  =  require('./utils/utils');

contract("DegenGangTreasury", async (accounts) => {
  const deployer = accounts[0];
  const defaultValue = '1000000000000000000';
  const tenETHValue = '10000000000000000000';

  beforeEach(async () => {
    // Create Degen-DegenGangTreasury Instance
    this.DegenGangTreasuryInstance = await DegenGangTreasury.new(
      accounts[4],  // Client
      accounts[5],  // Dev
      accounts[6],  // Member A
      accounts[7],  // Member B
      accounts[8],  // Community
      { from: deployer }
    );
    // Create Degen-DegenGangTreasury Contract
    this.DegenGangTreasury = await new web3.eth.Contract(DegenGangTreasuryABI.abi, this.DegenGangTreasuryInstance.address);
  });

  describe('Test - Withdraw DegenGangTreasury', async() => {
    beforeEach(async () => {
      await web3.eth.sendTransaction({
        from: accounts[0],
        to: this.DegenGangTreasuryInstance.address,
        value: tenETHValue
      });
    });

    it ('Check Client&Dev Address', async() => {
      // Get Client Address
      const clientAddress = await callMethod(this.DegenGangTreasury.methods.clientAddress, []);
      // Check Client Address
      assert.equal(clientAddress, accounts[4]);

      // Get Dev Address
      const devAddress = await callMethod(this.DegenGangTreasury.methods.devAddress, []);
      // Check Dev Address
      assert.equal(devAddress, accounts[5]);

      // Get MemberA Address
      const teamMemberA = await callMethod(this.DegenGangTreasury.methods.teamMemberA, []);
      // Check Dev Address
      assert.equal(teamMemberA, accounts[6]);

      // Get MemberB Address
      const teamMemberB = await callMethod(this.DegenGangTreasury.methods.teamMemberB, []);
      // Check Dev Address
      assert.equal(teamMemberB, accounts[7]);

      // Get Community Address
      const communityAddress = await callMethod(this.DegenGangTreasury.methods.communityAddress, []);
      // Check Community Address
      assert.equal(communityAddress, accounts[8]);
    });

    it ('Check Withdraw DegenGangTreasury - no Owner call it', async() => {
      // Set Total Sale Element
      await truffleAssert.reverts(
        this.DegenGangTreasuryInstance.withdrawAll({ from: accounts[1] }),
        "Ownable: caller is not the owner"
      );
    });

    it ('Cehck Withdraw DegenGangTreasury', async() => {
      // Get Contract Balance
      const contractBalance = new BigNumber(await web3.eth.getBalance(this.DegenGangTreasuryInstance.address));
      const clientAmount = contractBalance.multipliedBy(1750).dividedBy(10000);
      const devAmount = contractBalance.multipliedBy(1750).dividedBy(10000);
      const memberAAmount = contractBalance.multipliedBy(1750).dividedBy(10000);
      const memberBAmount = contractBalance.multipliedBy(1750).dividedBy(10000);
      const communityAmount = contractBalance.minus(clientAmount).minus(devAmount).minus(memberAAmount).minus(memberBAmount);

      // Get Admin Account
      const clientAddress = await callMethod(this.DegenGangTreasury.methods.clientAddress, []);
      const oldAdminBalance = new BigNumber(await web3.eth.getBalance(clientAddress));

      // Get Dev Account
      const devAddress = await callMethod(this.DegenGangTreasury.methods.devAddress, []);
      const oldDevBalance = new BigNumber(await web3.eth.getBalance(devAddress));

      // Get MemberA Account
      const memberAAddress = await callMethod(this.DegenGangTreasury.methods.teamMemberA, []);
      const oldMemberABalance = new BigNumber(await web3.eth.getBalance(memberAAddress));

      // Get MemberB Account
      const memberBAddress = await callMethod(this.DegenGangTreasury.methods.teamMemberB, []);
      const oldMemberBBalance = new BigNumber(await web3.eth.getBalance(memberBAddress));

      // Get Community Account
      const communityAddress = await callMethod(this.DegenGangTreasury.methods.communityAddress, []);
      const oldCommunityBalance = new BigNumber(await web3.eth.getBalance(communityAddress));

      // Call Withdraw All
      await this.DegenGangTreasuryInstance.withdrawAll({ from: deployer });

      // Get Update Balance
      const newAdminBalance = new BigNumber(await web3.eth.getBalance(clientAddress));
      const newDevBalance = new BigNumber(await web3.eth.getBalance(devAddress));
      const newMemberABalance = new BigNumber(await web3.eth.getBalance(memberAAddress));
      const newMemberBBalance = new BigNumber(await web3.eth.getBalance(memberBAddress));
      const newCommunityBalance = new BigNumber(await web3.eth.getBalance(communityAddress));

      // Check Balance
      assert.equal(newAdminBalance.minus(oldAdminBalance).toFixed(), clientAmount.toFixed());
      assert.equal(newDevBalance.minus(oldDevBalance).toFixed(), devAmount.toFixed());
      assert.equal(newMemberABalance.minus(oldMemberABalance).toFixed(), memberAAmount.toFixed());
      assert.equal(newMemberBBalance.minus(oldMemberBBalance).toFixed(), memberBAmount.toFixed());
      assert.equal(newCommunityBalance.minus(oldCommunityBalance).toFixed(), communityAmount.toFixed());

    });
  });
})