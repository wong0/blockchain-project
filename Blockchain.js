const SHA256 = require('crypto-js/sha256');

const Block = require("./Block");
const Transaction = require("./Transaction");

/**
 * how often the difficulty should adjust to the increasing or decreasing network hashrate.
 */
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;

/**
 * how often a block should be found.
 */
const BLOCK_GENERATION_INTERVAL = 10;

module.exports = class Blockchain{

    getDifficulty() {
        const latestBlock = this.getLatestBlock();

        const isTimeToAdjustDifficulty = 
            latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && 
            latestBlock.index !== 0 && 
            latestBlock.index > DIFFICULTY_ADJUSTMENT_INTERVAL;

        if (isTimeToAdjustDifficulty) {
            return getAdjustedDifficulty(latestBlock, this.chain);
        } else {
            return latestBlock.difficulty;
        }
    }

    getAdjustedDifficulty(latestBlock, blockchain) {
        // console.log(
        //     'blockchain.length ', blockchain.length, 
        //     'DIFFICULTY_ADJUSTMENT_INTERVAL ', DIFFICULTY_ADJUSTMENT_INTERVAL
        // )

        const prevAdjustmentBlock = blockchain[blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
        
        /**
         * expected time to get a new block
         */
        const timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;

        // console.log('latestBlock.timestamp ', latestBlock.timestamp)
        // console.log('prevAdjustmentBlock ', prevAdjustmentBlock)

        const timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;

        if (timeTaken < timeExpected / 2) {
            return prevAdjustmentBlock.difficulty + 1;
        } else if (timeTaken > timeExpected * 2) {
            return prevAdjustmentBlock.difficulty - 1;
        } else {
            return prevAdjustmentBlock.difficulty;
        }
    }

    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];

        // Mining Reward, AKA value of coinbase transaction
        this.miningReward = 100;
    }

    /**
     * The first block of the blockchain
     */
    createGenesisBlock(){
        console.log('Create Genesis Block\n');
        return new Block("01/01/2017", [], "9");
    }

    getLatestBlock(){
        // console.log('getLatestBlock');
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress) {
        
        // add Coinbase Transaction
        this.createTransaction( new Transaction(null, miningRewardAddress, this.miningReward))

        // mine block
        const block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);

        block.mineBlock(this.getDifficulty());

        // chain push
        console.log('Block successfully mined!\n');
        this.addBlock(block);

        // clear pendingTransactions already added to block
        this.pendingTransactions = [];

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

    /**
     * To generate a block we must know the hash of the previous block and 
     * create the rest of the required content (= index, hash, data and timestamp). 
     * Block data is something that is provided by the end-user. 
     * 
     * @param {Block} newBlock 
     */
    addBlock(newBlock){
        newBlock.index = (this.getLatestBlock().index ? this.getLatestBlock().index : 0) + 1;
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);

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
                console.log('isChainValid hasValidTransactions: false')
                return false;
            }

            // if any current block hash is not equal to hash of its contents, return invalid.
            if (
                currentBlock.hash !== currentBlock.calculateHash(
                    currentBlock.index,
                    currentBlock.previousHash,
                    currentBlock.timestamp,
                    currentBlock.transactions,
                    currentBlock.nonce
                ) ||
                currentBlock.previousHash !== previousBlock.hash
            ) {
                console.log(
                    '\nisChainValid currentBlock.hash !== currentBlock.calculateHash(): ',
                    currentBlock.hash !== currentBlock.calculateHash(
                        currentBlock.index,
                        currentBlock.previousHash,
                        currentBlock.timestamp,
                        currentBlock.transactions,
                        currentBlock.nonce
                    ),
                    '\ncurrentBlock.hash  ', currentBlock.hash,
                    '\ncurrentBlock.calculateHash  ', currentBlock.calculateHash(
                        currentBlock.index,
                        currentBlock.previousHash,
                        currentBlock.timestamp,
                        currentBlock.transactions,
                        currentBlock.nonce
                    )
                );

                console.log(
                    'currentBlock.previousHash !== previousBlock.hash',
                    currentBlock.previousHash !== previousBlock.hash
                );

                return false;
            };
        }
        return true;
    }
}
