var RPToken = artifacts.require("./contracts/RPToken.sol");
var RPTokenSale = artifacts.require("./contracts/RPTokenSale.sol");

module.exports = function(deployer){
	deployer.deploy(RPToken, 1000000).then(function(){
		var tokenPrice = 1000000000000000;
		return deployer.deploy(RPTokenSale, RPToken.address, tokenPrice);
	});
};