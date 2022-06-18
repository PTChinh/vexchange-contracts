const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const UniswapV2Router02 = artifacts.require("VexchangeV2Router02");
const IERC20 = artifacts.require("IERC20");

const factory = process.env.FACTORY_ADDRESS; // From core, BSC testnet
const userWalletAddress = process.env.MY_TEST_ADDRESS; // My BSC address
const liquidityProviderAddress = process.env.LP_ADDRESS; // Pool address
const WETH = process.env.WRAPPED_TOKEN_ADDRESS;  // WVET
const tokenAAddress = process.env.TOKEN_A_ADDRESS; // VTHO token vechain testnet
const tokenBAddress = process.env.TOKEN_B_ADDRESS; // VEUSD token vechain testnet

const DEPLOY_NEW = false;

function wf(name, address) {
    fs.appendFileSync('.env', name + "=" + address);
    fs.appendFileSync('.env', "\r\n");
}


module.exports = async function (deployer) {

    if (DEPLOY_NEW) {
        await deployer.deploy(UniswapV2Router02, factory, WETH);
        var iUniswapV2Router02 = await UniswapV2Router02.deployed();
        wf("iUniswapV2Router02", iUniswapV2Router02.address);
    } else {
        var iUniswapV2Router02 = await UniswapV2Router02.at(process.env.UNISWAP_ROUTER_V2);
    }

    // Approve before transfer
    var tokenA = await IERC20.at(tokenAAddress);
    var tokenB = await IERC20.at(tokenBAddress);

    await tokenA.approve(iUniswapV2Router02.address, "10000000000000000000000");
    await tokenB.approve(iUniswapV2Router02.address, "10000000000000000000000");

    console.log("Balance before swap");
    console.log("Pool token: A:", (await tokenA.balanceOf(liquidityProviderAddress)).toString());
    console.log("Pool token: B:", (await tokenB.balanceOf(liquidityProviderAddress)).toString());
    console.log("User Token A", (await tokenA.balanceOf(userWalletAddress)).toString());
    console.log("User Token B", (await tokenB.balanceOf(userWalletAddress)).toString());

    // Add pool
    await iUniswapV2Router02.swapExactTokensForTokens(
        "15000000000000000000", // AmountIn: 15 VTHO
        "250000000000000000",   // AmountOutMin 0.25 VTHO
        [tokenAAddress, tokenBAddress], // Path
        userWalletAddress,      // Swap to
        1657176936              // Deadline
    );

    console.log("Balance after swap");
    console.log("Pool token: A:", (await tokenA.balanceOf(liquidityProviderAddress)).toString());
    console.log("Pool token: B:", (await tokenB.balanceOf(liquidityProviderAddress)).toString());
    console.log("Token A", (await tokenA.balanceOf(userWalletAddress)).toString());
    console.log("Token B", (await tokenB.balanceOf(userWalletAddress)).toString());

    console.log("Done!!")
};
