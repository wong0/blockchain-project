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

// Encryption dependencies
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// Networking dependencies
var http = require("http");
var request = require('request');

// Express dependencies
var express = require('express');
var bodyParser = require("body-parser");

// Blockchain dependencies
var Block = require('./Block');
var Blockchain = require('./Blockchain');
var Transaction = require("./Transaction");
var TxOut = require("./TxOut");

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

// Add InvSender
var InvSender = require('./InvSender');
const invSender = new InvSender();

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
console.log('myWalletAddress', myWalletAddress, '\n');

//
// Initialization of Blockchain
//

// Initialize Singleton Blockchain instance
const xCoin = new Blockchain(myKey);

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
//     index: 0 
//   };
//   dbo.collection(dbCollectionName).insertOne(sampleBlock, function(err, res) {
//     if (err) throw err;
//     console.log("1 document sampleBlock inserted");
//     db.close();
//   });

    var query = {};
    dbo.collection(dbCollectionName).find(query).toArray(function(err, result) {
        if (err) throw err;
        console.log('test query result', result, '\n');

        // Restore queried blocks to current blockchain
        result.forEach(item => {
            console.log('Restore queried blocks to current blockchain: ', item, '\n');

            const block = new Block(
                item.timestamp,
                item.transactions,
                item.previousHash
            );

            block.hash = item.hash;
            block.nonce = item.nonce;
            block.index = item.index;

            xCoin.chain.push(block);
        });

        // After restoring queried blocks, print it out. 
        console.log(
            '\nRetrieved xCoin.chain from DB: \n', 
            xCoin.chain
        );

        db.close();
    });
});

// API caller dependencies
var InvSender = require('./InvSender');

// DEBUG
// process.argv.forEach((val, index) => {
//     console.log(`${index}: ${val}`)
// });
// console.log(process.argv[3]);

function triggerMineBlock() {
    // Create coinbase transaction from coinbase to me
    xCoin.createTransaction(new Transaction(null, null, 100))

    // Add mining pending transactions
    xCoin.minePendingTransactions(myWalletAddress);

    // console.log('\nMy Wallet Balance: ', xCoin.getBalanceOfAddress(myWalletAddress));
}

async function startup() {
    // console.log('startup()');

    console.log('Send getBlocks to other nodes...\n');

    // Array for all responses to be stored, 
    // and processed once all neightborNode list have been pinged.
    const neighborNodeErrorList = []; 
    const neighborNodeResponseList = []; 
    const neighborNodeBodyList = []; 

    console.log('neighborNodeList', neighborNodeList);

    var i = 0;
    // Assumption: We know what the other nodes are.
    // send out /version calls
    neighborNodeList.forEach(neighborNode => {
        request(`${neighborNode}/getBlocks`, function (response, request, body) {
            // console.error('error:', error); // Print the error if one occurred
            // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            
            console.log(
                `${neighborNode}/getBlocks: `, 
                // `\nreceived body:`, body, 
                // '\ntypeof body', typeof body
            ); // Print body

            // Save response to neighborNodeResponseList
            if (body) {
                neighborNodeResponseList.push(JSON.parse(body));
            }

            console.log(
                'neighborNodeList.length-1', neighborNodeList.length-1, 
                ', i', i
            );

            if (neighborNodeList.length-1 === i) {
                // Find Longest chain.
                var maxNeighborNodeBodyList = [];
                neighborNodeResponseList.forEach(response => {
                    if (response && response.length > maxNeighborNodeBodyList.length) {
                        maxNeighborNodeBodyList = response;
                    }
                });

                console.log(
                    `xCoin.chain.length ${xCoin.chain.length}` , 
                    `maxNeighborNodeBodyList.length ${maxNeighborNodeBodyList.length}`
                );

                // IF this node has a longer chain than the others, send inv.
                // ELSE adopt longest chain received from getBlocks.
                if (xCoin.chain.length > maxNeighborNodeBodyList.length) {
                    // send Inv
                    const invSender = new InvSender();
                    invSender.sendInvToNeighbors(xCoin.chain, neighborNodeList);
                } else {
                    // Adopt longest chain
                    xCoin.chain = maxNeighborNodeBodyList;

                    // Save this chain!
                    const blockchainSaver = new BlockchainSaver();
                    blockchainSaver.saveBlockchainToDisk(xCoin.chain);
                }
            }

            i++;
        });
    });
}

var app = express();
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/getBlocks', function(req, res){
    // Handle GET Blocks
    // console.debug('/getBlocks : ', xCoin.chain);

    // Send my inventory
    res.send(xCoin.chain);
});

app.post('/inv', function(req, res){
    // Handle GET inv

    // TODO take in blocks received.
    // If longer than mine, use theirs

    console.log('/inv req.body', req.body, '\n');
    // console.log('/inv res', res);
});

app.get('/triggerMineBlock', function(req, res) {
    // Handle GET triggerMineBlock

    triggerMineBlock();

    res.send(JSON.stringify({
        success: true,
        msg: 'Block successfully mined!',
    }))
});

var TransactionSender = require('./TransactionSender');

// Trigger transaction request from a sender (eg. Alice)
app.post('/transactionRequest', function(req, res) {
    
    console.log('req.body.amount', req.body.amount, '\n');

    console.log('req.body.receiveWalletAddress', req.body.receiveWalletAddress);

    // Handle POST transaction received
    console.log('/transactionRequest req.body', req.body, '\n');

    const txIns = []; // txIns

    const transaction = new Transaction(
        myWalletAddress, // fromAddress,
        req.body.receiveWalletAddress, // toAddress,
        req.body.amount, // amount,
        null, // id,
        txIns, // txIns,
        [
            new TxOut(
                req.body.receiveWalletAddress,
                req.body.amount,
            )
        ] // txOuts
    );

    transaction.id = transaction.getTransactionId();

    transaction.signTransaction(myKey);

    // Add to my unpending transactions
    xCoin.addTransaction(transaction);

    // Let others know about this transaction
    const transactionSender = new TransactionSender();
    transactionSender.sendTransactionToNeighbors(transaction, neighborNodeList);
    
});

var BlockchainSaver = require('./BlockchainSaver');

app.post('/transaction', function(req, res) {
    // Handle POST transaction received
    console.log(
        '/transaction req.body ', req.body, 
        // ', res ', res, 
        '\n'
    );

    // parse into a transaction

    // res.send(JSON.stringify(req.body));

    // ASSUMPTION: req.body is a correct transaction.
    
    // put it in a pool of pendingTransactions.
    xCoin.createTransaction(req.body)

    // create a block to put this transaction, trigger mining, return mined newBlock
    const newBlock = xCoin.minePendingTransactions(myWalletAddress);

    // send '/inv' to broadcast new blockchain
    invSender.sendInvToNeighbors(xCoin.chain, neighborNodeList); 

    // Update my chain in DB
    const blockchainSaver = new BlockchainSaver();
    blockchainSaver.saveBlockchainToDisk(xCoin.chain);

});

app.listen(process.argv[2]);

startup();

// Console will print the message
console.log(`Server running at http://127.0.0.1:${process.argv[2]}/`);


