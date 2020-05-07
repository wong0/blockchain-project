/*

Usage:

node <full name of this file> <port number> <neighbor node list of full http addresses>

start 3 nodes, that are all neighbors of each other

node FullNode.js 8881 http://127.0.0.1:8882,http://127.0.0.1:8883
node FullNode.js 8882 http://127.0.0.1:8883,http://127.0.0.1:8881
node FullNode.js 8883 http://127.0.0.1:8881,http://127.0.0.1:8882



 */
const Block = require('./Block');
const Blockchain = require('./Blockchain');

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

var http = require("http");

const request = require('request');

// Get NeighborNodeList
const neighborNodeList = process.argv[3].split(',');

// Get PrivateKey
const privateKey = process.argv[4];

// DEBUG
// process.argv.forEach((val, index) => {
//     console.log(`${index}: ${val}`)
// });
// console.log(process.argv[3]);

function createWallet() {
    console.log('createWallet()');

    // Create key     // ec.keyFromPrivate('dnsfhai2ibrb2jknjxcvniuwea')
    const myKey = ec.keyFromPrivate(privateKey)

    // Create Wallet address
    const myWalletAddress = myKey.getPublic('hex');

    let xCoin = new Blockchain();

    // Create coinbase transaction from coinbase to me
    // TODO

}

async function startup() {
    // console.log('startup()');

    createWallet();

    console.log('Send getBlocks to other nodes...');

    // Array for all responses to be stored, 
    // and processed once all neightborNode list have been pinged.
    const neighborNodeErrorList = []; 
    const neighborNodeResponseList = []; 
    const neighborNodeBodyList = []; 

    // Assumption: We know what the other nodes are.
    // send out /version calls
    neighborNodeList.forEach(neighborNode => {
        request(`${neighborNode}/getBlocks`, function (error, response, body) {
            console.error('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); // Print body

            // save response to neighborNodeResponseList
            neighborNodeErrorList.push(error);
            neighborNodeResponseList.push(response);
            neighborNodeBodyList.push(body);
        });
    });

    // IF this node has a longer chain than the others, send inv.
    // ELSE send getBlocks to get blocks. 
    
}

function saveBlockchainToDisk(blockchain) {
    // TODO save blockchain to disk
    
}


function saveStateToMemory(state) {
    // TODO save state to memory
}


var express = require('express');
var app = express();

app.get('/getBlocks', function(req, res){
    // Handle GET Blocks

    res.send("GET Blocks API!");
    // Exchange inventory

    // This is done to reduce network load, 
    // because blocks can be downloaded from different nodes, 
    // and we don’t want to download dozens of gigabytes from one node.

});

app.get('/inv', function(req, res){
    // Handle GET inv

    res.send(JSON.stringify({}));
})

app.listen(process.argv[2]);


startup();

// Console will print the message
console.log(`Server running at http://127.0.0.1:${process.argv[2]}/`);


