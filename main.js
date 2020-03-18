const SHA256 = require('crypto-js/sha256');

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

class Block {
    constructor(timestamp, transactions, previousHash = ''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = '';
        this.nonce = 0;
    }

    /**
     * Hash of index, previousHash, timestamp, data.
     */
    calculateHash(){
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined:" + this.hash);
    }
}

class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 1;
        this.pendingTransactions = [];
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
        console.log('addBlock', newBlock);
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    isChainValid() {
        console.log('isChainValid');

        for(let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

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

// Demo 1: Add block
function testAddBlock() {
    let xcoin = new Blockchain();
    xcoin.addBlock(new Block(1, "10/07/2017", { datakey: "datavalue"}));
    xcoin.addBlock(new Block(1, "10/07/2017", { datakey: "datavalue"}));
    
    console.log(JSON.stringify(xcoin, null, 4));
}

// Demo 2: isChainValid
function testIsChainValid() {
    console.log('BEFORE EDIT: xcoin.isChainValid()', xcoin.isChainValid());
    xcoin.chain[1].data = { amount: 123 };
    console.log('AFTER EDIT: xcoin.isChainValid()', xcoin.isChainValid());    
}

// Demo 3: mining
function testMiningBasic() {
    let xcoin = new Blockchain();

    console.log('Mining block 1...');
    
    xcoin.addBlock(new Block(1, "17/03/2020", { amount: 4 }));
    
    console.log('Mining block 2...');
    
    xcoin.addBlock(new Block(2, "17/03/2020", { amount: 8 }));
}

// testMiningBasic();
let xCoin = new Blockchain();
xCoin.createTransaction(new Transaction('address1', 'address2', 100));
xCoin.createTransaction(new Transaction('address2', 'address1', 50));

console.log('\n Starting the miner...');
xCoin.minePendingTransactions('xaviers-address');

console.log('\nBalance of xavier is', xCoin.getBalanceOfAddress('xaviers-address'));

console.log('\n Starting the miner 2nd time...');
xCoin.minePendingTransactions('xaviers-address');

console.log('\nBalance of xavier is', xCoin.getBalanceOfAddress('xaviers-address'));
