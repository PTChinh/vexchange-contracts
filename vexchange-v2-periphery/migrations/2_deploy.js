const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const UniswapV2Router02 = artifacts.require("VexchangeV2Router02");
const IERC20 = artifacts.require("IERC20");

const factory = process.env.FACTORY_ADDRESS; // vechain testnet
const liquidityProviderAddress = process.env.LP_ADDRESS; // Pool address
const WETH = process.env.WRAPPED_TOKEN_ADDRESS;  // WVET
const tokenAAddress = process.env.TOKEN_A_ADDRESS; // VTHO token vechain testnet
const tokenBAddress = process.env.TOKEN_B_ADDRESS; // VEUSD token vechain testnet

const DEPLOY_NEW = true;

function wf(name, address) {
    fs.appendFileSync('.env', name + "=" + address);
    fs.appendFileSync('.env', "\r\n");
}


module.exports = async function (deployer) {
    if (DEPLOY_NEW) {
        await deployer.deploy(UniswapV2Router02, factory, WETH);
        var iUniswapV2Router02 = await UniswapV2Router02.deployed();
        wf("UNISWAP_ROUTER_V2", iUniswapV2Router02.address);
    } else {
        var iUniswapV2Router02 = await UniswapV2Router02.at(process.env.UNISWAP_ROUTER_V2);
    }

    // Approve before transfer
    var tokenA = await IERC20.at(tokenAAddress);
    var tokenB = await IERC20.at(tokenBAddress);

    await tokenA.approve(iUniswapV2Router02.address, "10000000000000000000000");  // 10,000 VET
    await tokenB.approve(iUniswapV2Router02.address, "10000000000000000000000");  // 10,000 VEUSD

    // Add pool
    await iUniswapV2Router02.addLiquidity(
        tokenA.address,
        tokenB.address,
        "10000000000000000000",  // amountADesired - 10 VET
        "1000000",   // amountBDesired - 1 VEUSD
        "10000000000000000000",  // amountAMin     - 10 VET
        "1000000",   // amountBMin     - 1 VEUSD
        liquidityProviderAddress,   // LP address
        1657176936                  // deadline processing addLiquidity
    );

    console.log("Done!!")
};
