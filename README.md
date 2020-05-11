# blockchain-project

## Goals
1. Blockchain Prototype: construct the blockchain system according to the
following structure.
a) Index: the height of current block.
b) Data: any data that is included in the block
c) Timestamp: the creation time of block (seconds from Unix Epoch).
d) Previous Block Hash: SHA-256 hash of previous block.
e) Current Block Hash: SHA-256 hash of current block.
2. Mining: implement a Proof-of-Work algorithm.
a) Combine all the data in a block.
b) Calculate a SHA-256 hash value of these information.
c) If the output is under the target, you mine a new block successfully.
d) Otherwise, increment nonce by 1 and repeat step c).
3. Transaction:
a) Structure: one transaction consists of a transaction ID, an input, and an
output.
b) Transaction ID: the transaction ID is calculated by taking a hash of the
transaction contents.
c) Output: the output consists of an address and an amount of coins.
d) Input: the input consists where the coins are coming from (i.e., previous
transaction ID and index) along with a signature.
4. Network: two basic interactions should be realized.
a) getblock: it is used to get the blocks from the other nodes.
b) inv: it is used to inform the other nodes what blocks or transactions it has.
c) You could implement your network via socket, HTTP or different ports.
d) You could refer to some open source projects to implement your network.
5. Storage: two databases should be implemented.
a) Blockchain: it stores the raw data of the whole blockchain in disk.
b) State: it stores the latest state of the blockchain in memory.
c) You could refer to some open source projects to implement your databases.


## Grading Scheme

### Total marks 25

1. Create the blockchain according to the required structure 3
2. Mine a block successfully 3
3. Generate a transaction according to the requirement 3
4. Different nodes in the blockchain system can get blocks from other nodes 3
5. The blockchain data can be stored in disk and acquired later 3
6. Presentation and demonstration 5
7. Group report 3
8. Individual report 2


## Get Started

### Install Mongo DB
https://docs.mongodb.com/manual/administration/install-community/
On Mac:
$ brew tap mongodb/brew
$ brew install mongodb-community@4.2

### Start Mongo DB
$ brew services start mongodb-community@4.2
It should say:
==> Successfully started `mongodb-community` (label: homebrew.mxcl.m

### Install Redis
https://redis.io/topics/quickstart

### Start Redis
Start Redis, by running `redis server`. 
To verify Redis is working, run `redis-cli ping`.

### Run this Application

Run `node FullNode.js <port number> <neighbor node list of full http addresses> <Private Key>`

Usage:

Start 3 nodes, that are all neighbors of each other:
'''
node FullNode.js 8881 http://127.0.0.1:8882,http://127.0.0.1:8883 dnsfhai2ibrb2jknjxcvniuwea
node FullNode.js 8882 http://127.0.0.1:8883,http://127.0.0.1:8881 dnsfhai2ibrb2jknjxcvniuweb
node FullNode.js 8883 http://127.0.0.1:8881,http://127.0.0.1:8882 dnsfhai2ibrb2jknjxcvniuwec
'''

Run `node main.js`
