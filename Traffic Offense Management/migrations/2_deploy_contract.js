//var badge = artifacts.require("./badge.sol");
var traffic = artifacts.require("./traffic.sol");

module.exports = function(deployer) {
  //deployer.deploy(badge);
  deployer.deploy(traffic);
};


