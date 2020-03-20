/*

Usage:

node <full name of this file> <port number> <neighbor node list>

 */

var http = require("http");

const request = require('request');

const neighborNodeList = process.argv[3].split(',');

// DEBUG
// process.argv.forEach((val, index) => {
//     console.log(`${index}: ${val}`)
// });
// console.log(process.argv[3]);

function startup() {
    console.log('startup()');
    console.log('Send getBlocks to other nodes');

    // Assumption: We know what the other nodes are.
    // send out /version calls
    neighborNodeList.forEach(neighborNode => {
        request(`${neighborNode}/version`, function (error, response, body) {
            console.error('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); // Print body

            // IF this node has a longer chain than the others, send version.
            // ELSE send getBlocks to get blocks. 

        });
    });
}

startup();

var express = require('express');
var app = express();

app.get('/version', function(req, res) {
    // Handle GET version

    res.send("GET version API!");
    
});

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

    res.send("GET inv API!");
})

app.listen(process.argv[2]);

// Console will print the message
console.log(`Server running at http://127.0.0.1:${process.argv[2]}/`);