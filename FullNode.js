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
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

const dbName = "blockchain-coin-db";
const dbCollectionName = "blockchain";

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(dbName);
    console.log("MongoDB Database created/initialized!\n");

    // // Test Create Collection
    // dbo.createCollection(dbCollectionName, function(err, res) {
    //     if (err) throw err;
    //     console.log("Collection 'blocks' created!");
    //     db.close();
    // });

//   // input a sample block
//   var sampleBlock = {
//     timestamp: 1588869890691,
//     transactions: [ [Object] ],
//     previousHash: '07a6861b81748204f9205353e498c885020ed3290967a759aaa385ca27fd5e1c',
//     hash: '0169cd33b6b487a27648d14d6e2db3852bb842a3d004d946b705a1a3526892c2',
//     nonce: 22,
//     height: 0 
//   };

//   dbo.collection(dbCollectionName).insertOne(sampleBlock, function(err, res) {
//     if (err) throw err;
//     console.log("1 document sampleBlock inserted");
//     db.close();
//   });

    var query = {};
    dbo.collection(dbCollectionName).find(query).toArray(function(err, result) {
        if (err) throw err;
        console.log('test query result', result);

        let xCoin = new Blockchain();

        // Restore queried blocks to current blockchain
        result.forEach(item => {
            console.log('item', item);

            const block = new Block(
                item.timestamp,
                item.transactions,
                item.previousHash
            );

            block.hash = item.hash;
            block.nonce = item.nonce;
            block.height = item.height;

            xCoin.chain.push(block);
        });

        // After restoring queried blocks, print it out. 
        console.log(
            '\nRetrieved xCoin.chain: \n', 
            xCoin.chain
        );

        db.close();
    });
});


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

    console.log('\nMy Wallet Balance: ', xCoin.getBalanceOfAddress(myWalletAddress));
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

    // Test
    const neighborNodeErrorList = [
        {
            
        }
    ]; 
    const neighborNodeResponseList = [
        {

        }
    ]; 
    const neighborNodeBodyList = [
        {

        }
    ];

    // IF this node has a longer chain than the others, send inv.
    // ELSE adopt longest chain received from getBlocks.
    if (xCoin.chain.length > neighborNodeBodyList) {
        // send Inv
    } else {
        // adopt longest chain
    }

}

function sendInvToNeighbors(myBlockchain) {
    neighborNodeList.forEach(neighborNode => {
        request.post('sendInv', {
            // todo convert blockchain to sendable
        })
    })
}

var express = require('express');
var app = express();

app.get('/getBlocks', function(req, res){
    // Handle GET Blocks

    res.send(JSON.stringify(xCoin.chain));
    // Exchange inventory

    // This is done to reduce network load, 
    // because blocks can be downloaded from different nodes, 
    // and we don’t want to download dozens of gigabytes from one node.

});

app.get('/inv', function(req, res){
    // Handle GET inv

    // TODO take in blocks received.
    // If longer than mine, use theirs
    console.log('/inv req', req)
    console.log('/inv res', res)
    
});

app.get('/triggerMineBlock', function(req, res) {
    // Handle GET triggerMineBlock

    triggerMineBlock();

    res.send(JSON.stringify({
        success: true,
        msg: 'Block successfully mined!',
    }))
});


// TODO: POST transaction
app.post('/transaction', function(req, res) {
    // Handle POST transaction
    console.log('req', req);

    // put it in a pool of pending transactions.

    // create a block to put this transaction

    // trigger mining.
});

app.listen(process.argv[2]);

startup();

// Console will print the message
console.log(`Server running at http://127.0.0.1:${process.argv[2]}/`);


