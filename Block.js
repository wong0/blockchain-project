const SHA256 = require('crypto-js/sha256');

/**
 * A Blockchain has Block(s)
 * A Block contains Transactions, previousHash, timestamp
 */
module.exports = class Block {
    constructor(timestamp, transactions, previousHash = ''){
        this.index = 0;
        this.hash = '';
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.nonce = 0;
    }

    /**
     * Hash of index, previousHash, timestamp, transactions, Nonce.
     */
    calculateHash(index, previousHash, timestamp, transactions, nonce){
        return SHA256(index + previousHash + timestamp + JSON.stringify(transactions) + nonce).toString();
    }

    hexToBinary(hex) {
        return (parseInt(hex, 16).toString(2)).padStart(8, '0');
    }

    hashMatchesDifficulty(hash, difficulty) {
        const requiredPrefix = '0'.repeat(difficulty);

        console.log(
            `hashMatchesDifficulty: hash:`, hash, 
            '\ndifficulty: ', difficulty, 
            '\n'
        );

        return hash.startsWith(requiredPrefix);
    }

    /**
     * mineBlock
     * @param {number} index 
     * @param {string} previousHash 
     * @param {number} timestamp 
     * @param {array} transactions 
     * @param {number} difficulty 
     */
    mineBlock(difficulty) {
        let nonce = 0;
        while (true) {
            const hash = this.calculateHash(this.index, this.previousHash, this.timestamp, this.transactions, nonce);
            if (this.hashMatchesDifficulty(hash, difficulty)) {
                this.difficulty = difficulty;
                this.nonce = nonce;
                this.hash = hash;

                console.log("findBlock:\nBlock mined: hash:", this.hash, "\nthis.difficulty:", this.difficulty);

                return this;
            }
            nonce++;
        }
    }

    /**
     * Validates all transactions of this Block
     */
    hasValidTransactions() {
        console.log('hasValidTransactions: this.transactions: ', this.transactions);
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false;
            }
        }
        return true;
    }

    /**
     * Block Integrity Validation
     * 
     * For block to be valid:
     * - Index of block must be one number larger than previous
     * - PreviousHash of block match hash of previous block
     * - Hash of block itself must be valid
     * 
     */
    isValidNewBlock(newBlock, previousBlock) {
        if (previousBlock.index + 1 !== newBlock.index) return false
        else if (previousBlock.hash !== newBlock.previousHash) return false
        else if (this.hash(newBlock) !== newBlock.hash) return false
        else return false
    }
};