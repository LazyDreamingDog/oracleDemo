const HashOracle = artifacts.require("HashOracle")

module.exports = function(deployer) {
    deployer.deploy(HashOracle)
};