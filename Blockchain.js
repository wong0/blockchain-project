const SHA256 = require('crypto-js/sha256');

const Block = require("./Block");
const Transaction = require("./Transaction");

module.exports = class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 1;
        this.pendingTransactions = [];

        // Mining Reward, AKA value of coinbase transaction
        this.miningReward = 100;
    }

    /**
     * The first block of the blockchain
     */
    createGenesisBlock(){
        console.log('Create Genesis Block');
        return new Block(0, "01/01/2017", [], "9");
    }

    getLatestBlock(){
        console.log('getLatestBlock');
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress) {
        // mine block
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        // chain push
        console.log('Block successfully mined!');
        this.chain.push(block);

        // add pending transactions
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];

        return block;
    }

    // create a new transaction in pendingTransactions.
    createTransaction(transaction) {
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }

    addBlock(newBlock){
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        newBlock.height = this.getLatestBlock().height;

        console.log(
            'addBlock:\n',
            'newBlock: ', newBlock, 
            '\nthis.difficulty', this.difficulty,
        );

        this.chain.push(newBlock);
    }

    /**
     * Add a transaction to the Blockchain.
     * @param {*} transaction 
     */
    addTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from, and to addresses');
        }

        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }

        this.pendingTransactions.push(transaction);
    }

    isChainValid() {
        console.log('isChainValid');

        for(let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            // verify that each block has valid transactions
            if (!currentBlock.hasValidTransactions()) {
                return false;
            }

            // if any current block hash is not equal to hash of its contents, return invalid.
            if (
                currentBlock.hash !== currentBlock.calculateHash() ||
                currentBlock.previousHash !== previousBlock.hash
            ) {
                return false;
            };
        }
        return true;
    }
}
