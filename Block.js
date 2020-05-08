const SHA256 = require('crypto-js/sha256');

/**
 * A Blockchain has Block(s)
 * A Block contains Transactions, previousHash, timestamp
 */
module.exports = class Block {
    constructor(timestamp, transactions, previousHash = ''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = '';
        this.nonce = 0;
        this.height = 0;
    }

    /**
     * Hash of index, previousHash, timestamp, data.
     */
    calculateHash(){
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    /**
     * Mine Block
     * @param {*} difficulty 
     */
    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined:" + this.hash);
    }

    /**
     * Validates all transactions of this Block
     */
    hasValidTransactions() {
        // console.log('hasValidTransactions: this.transactions: ', this.transactions);
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false;
            }
        }
        return true;
    }
};