pragma solidity ^0.5.2;


import "./RPToken.sol";

contract RPTokenSale {
	address payable admin;
	RPToken public tokenContract;
	uint256 public tokenPrice;
	uint256 public tokensSold;

	event Sell(address _buyer, uint256 _amount);

	constructor(RPToken _tokenContract, uint256 _tokenPrice) public{
		admin = msg.sender;
		tokenContract = _tokenContract;
		tokenPrice = _tokenPrice;
	}

	function multiply(uint x, uint y) internal pure returns (uint z) { 
		require(y==0 || (z = x*y) / y == x);
	}

	function buyTokens (uint256 _numberOfTokens) public payable {
		require(msg.value == multiply(_numberOfTokens, tokenPrice)); 
		// Require that value equal to tokens 

		require(tokenContract.balanceOf(address(this)) >= _numberOfTokens); 
		// Require that contract has enough tokens

		require (tokenContract.transfer(msg.sender, _numberOfTokens));
		// Require that a transfer is successful

		tokensSold += _numberOfTokens;
 		emit Sell(msg.sender, _numberOfTokens); //Trigger Sell Event
 	}

 	function endSale() public {
		require(msg.sender == admin); 
		require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this)))); 
		selfdestruct(admin); 
	}
}
