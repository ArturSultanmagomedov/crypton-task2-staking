//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor(uint256 _totalSupply) ERC20("Token", "TKN") {
        _mint(msg.sender, _totalSupply);
    }
}
