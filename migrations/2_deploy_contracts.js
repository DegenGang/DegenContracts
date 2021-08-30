const fs = require('fs');
const DegenGang = artifacts.require("./DegenGang.sol");

function expertContractJSON(contractName, instance) {
  const path = "./test/abis/" + contractName + ".json";
  const data = {
    contractName,
    "address": instance.address,
    "abi": instance.abi
  }

  fs.writeFile(path, JSON.stringify(data), (err) => {
    if (err) throw err;
    console.log('Contract data written to file');
  });  
};

module.exports = async function (deployer) {
  const zeroAddress = '0x0000000000000000000000000000000000000000';
  await deployer.deploy(DegenGang, zeroAddress, zeroAddress, zeroAddress, zeroAddress, zeroAddress);

  expertContractJSON('DegenGang', DegenGang);
};
