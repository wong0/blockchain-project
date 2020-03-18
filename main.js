const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(index, timestamp, data, previousHash = ''){
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = '';
    }

    /**
     * Hash of index, previousHash, timestamp, data.
     */
    calculateHash(){
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
    }
}

class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
    }

    /**
     * The first block of the blockchain
     */
    createGenesisBlock(){
        console.log('Create Genesis Block');
        return new Block(0, "01/01/2017", "Genesis block", "9");
    }

    getLatestBlock(){
        console.log('getLatestBlock');
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock){
        console.log('newBlock');
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
    }
}

let xcoin = new Blockchain();
xcoin.addBlock(new Block(1, "10/07/2017", { datakey: "datavalue"}));
xcoin.addBlock(new Block(1, "10/07/2017", { datakey: "datavalue"}));

console.log(JSON.stringify(xcoin, null, 4));
