/*

Usage:

node <full name of this file> <port number> <neighbor node list of full http addresses> <Private Key>

start 3 nodes, that are all neighbors of each other

node FullNode.js 8881 http://127.0.0.1:8882,http://127.0.0.1:8883 dnsfhai2ibrb2jknjxcvniuwea
node FullNode.js 8882 http://127.0.0.1:8883,http://127.0.0.1:8881 dnsfhai2ibrb2jknjxcvniuweb
node FullNode.js 8883 http://127.0.0.1:8881,http://127.0.0.1:8882 dnsfhai2ibrb2jknjxcvniuwec

 */

//
// Dependencies
//

// Blockchain dependencies
const Block = require('./Block');
const Blockchain = require('./Blockchain');
const Transaction = require("./Transaction");
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// Storage dependencies - Redis
var redis = require('redis');
var client = redis.createClient();

// Storage Redis client init
client.on('connect', function() {
    console.log('Redis is connected!\n');
});

// Redis Storage Test - Key-value pair
// client.save(['key', 'value']); 

// Storage dependencies - Mongo 



// Networking dependencies
var http = require("http");
const request = require('request');

//
// Get Args
//

// Get NeighborNodeList arg
const neighborNodeList = process.argv[3].split(',');

// Get PrivateKey arg
const privateKey = process.argv[4];

// Create key
const myKey = ec.keyFromPrivate(privateKey)

// Create Wallet address
const myWalletAddress = myKey.getPublic('hex');

//
// Initialization of Blockchain
//

// Initialize Singleton Blockchain instance
const xCoin = initializeBlockchain();

// DEBUG
// process.argv.forEach((val, index) => {
//     console.log(`${index}: ${val}`)
// });
// console.log(process.argv[3]);

function initializeBlockchain() {
    return new Blockchain();
}

function triggerMineBlock() {
    // Create coinbase transaction from coinbase to me
    xCoin.createTransaction(new Transaction(null, null, 100))

    // Add mining pending transactions
    xCoin.minePendingTransactions(myWalletAddress);
}

async function startup() {
    // console.log('startup()');

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
});

app.get('/triggerMineBlock', function(req, res) {
    // Handle GET triggerMineBlock

    triggerMineBlock();

    res.send(JSON.stringify({
        success: true,
        msg: 'Block successfully mined!',
    }))
});

app.listen(process.argv[2]);

startup();

// Console will print the message
console.log(`Server running at http://127.0.0.1:${process.argv[2]}/`);


