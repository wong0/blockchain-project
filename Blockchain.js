const SHA256 = require('crypto-js/sha256');

const Block = require("./Block");
const Transaction = require("./Transaction");
const TxOut = require("./TxOut");

const SignatureUtils = require("./SignatureUtils");

const signatureUtils = new SignatureUtils();

/**
 * how often the difficulty should adjust to the increasing or decreasing network hashrate.
 */
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;

/**
 * how often a block should be found.
 */
const BLOCK_GENERATION_INTERVAL = 10;

module.exports = class Blockchain{

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

    getDifficulty() {
        const latestBlock = this.getLatestBlock();

        const isTimeToAdjustDifficulty = 
            latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && 
            latestBlock.index !== 0 && 
            latestBlock.index > DIFFICULTY_ADJUSTMENT_INTERVAL;

        if (isTimeToAdjustDifficulty) {
            return this.getAdjustedDifficulty(latestBlock, this.chain);
        } else if (latestBlock.difficulty) {
            return latestBlock.difficulty;
        } else {
            return 1;
        }
    }

    constructor(keyPair){
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];

        // Mining Reward, AKA value of coinbase transaction
        this.miningReward = 100;

        // Use keypair
        this.keyPair = keyPair;
    }

    /**
     * The first block of the blockchain
     */
    createGenesisBlock(){
        console.log('Create Genesis Block\n');
        return new Block("1589453315955", [], "");
    }

    getLatestBlock(){
        // console.log('getLatestBlock');
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress) {
        const coinBaseTxIns = [
        ]; // Coinbase transaction has no Transactions In
        const coinBaseTxOuts = [
            new TxOut(miningRewardAddress, this.miningReward),
        ]; // Coinbase Transactions Out

        // Create Coinbase Transaction
        const coinBaseTransaction = new Transaction(
            null, 
            miningRewardAddress, // Todo hopefully we don't need this after sometime.
            this.miningReward,
            null,
            coinBaseTxIns,
            coinBaseTxOuts
        );
        const id = coinBaseTransaction.getTransactionId(true);
        const msgHash = coinBaseTransaction.calculateHashV2();
        const signature = signatureUtils.signHash(
            this.keyPair,
            msgHash
        );
        coinBaseTransaction.signature = signature;

        // Add Coinbase Transaction
        this.createTransaction(coinBaseTransaction);

        console.log(`Adding Coinbase Transaction with id ${id}, \nmsgHash ${msgHash}, \nsignature ${signature}\n`)

        // Mine block
        const date = Date.now();
        const block = new Block(date, this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.getDifficulty());
        console.log(`Mine block at difficulty ${this.getDifficulty()}, at ${date}, with previous hash ${this.getLatestBlock().hash}.`)

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

    /**
     * 
     * @param {string} address 
     */
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

        console.debug(`getBalanceOfAddress(${address}) = ${balance} (coins)`);

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
        newBlock.mineBlock(this.getDifficulty());

        console.debug(
            'Add Block:\n',
            'newBlock: ', newBlock, 
            '\nthis.getDifficulty() (Calculated) ', this.getDifficulty(),
            '\nthis.chain', this.chain,
            '\ntypeof this.chain', typeof this.chain, '\n'
        );

        this.chain.push(newBlock);
    }

    /**
     * Add a transaction to the Blockchain.
     * @param {*} transaction 
     */
    addTransaction(transaction) {
        console.log('Add Transaction: ', transaction);

        if (
            !transaction.fromAddress || 
            !transaction.toAddress
        ) {
            throw new Error('Transaction must include from, and to addresses');
        }

        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }

        this.pendingTransactions.push(transaction);
    }

    isChainValid() {
        console.debug('isChainValid()');

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
