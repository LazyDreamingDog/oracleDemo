const fs = require('fs')
const Web3 = require('web3')
const ganache = require('ganache-cli')
const { type } = require('os')
//const { Client, NonceTxMiddleware, SignedTxMiddleware, LocalAddress, CryptoUtils, LoomProvider } = require('loom-js')


async function loadAccount () {
    const provider = new Web3.providers.WebsocketProvider("ws://localhost:7545")
    const web3js = new Web3(provider);
    //console.log(web3js)
    const objAccounts = await web3js.eth.getAccounts()
    var accounts = []
    for (var i in objAccounts) {
      accounts.push(objAccounts[i]);
    }
    const client = 0;
    return {
    accounts,
    web3js: web3js,
    client
    }
}

module.exports = {
  loadAccount,
};