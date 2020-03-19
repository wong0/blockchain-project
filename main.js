const Block = require('./Block');
const Blockchain = require('./Blockchain');

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

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

const Transaction = require('./Transaction');

/**
 * Test that successful mining of a block is rewarded
 */
function testMiningBalance() {
    let xCoin = new Blockchain();
    xCoin.createTransaction(new Transaction('address1', 'address2', 100));
    xCoin.createTransaction(new Transaction('address2', 'address1', 50));    

    console.log('\n Starting the miner...');
    xCoin.minePendingTransactions('xaviers-address');
    
    console.log('\nBalance of xavier is', xCoin.getBalanceOfAddress('xaviers-address'));
    
    console.log('\n Starting the miner 2nd time...');
    xCoin.minePendingTransactions('xaviers-address');
    
    console.log('\nBalance of xavier is', xCoin.getBalanceOfAddress('xaviers-address'));
    
}

/**
 * Demo 4 
 * testSigningTransaction
 * Test that a transaction can be signed, 
 * so that unauthorized modification to the transaction is detectable.
 */
function testSigningTransaction(shouldTamper) {
    const myKey = ec.keyFromPrivate('dnsfhai2ibrb2jknjxcvniuwea')
    const myWalletAddress = myKey.getPublic('hex');

    let xCoin = new Blockchain();
    
    // Create a transaction
    const tx1 = new Transaction(myWalletAddress, 'public key', 10)
    // Sign the transaction
    tx1.signTransaction(myKey);
    // Add transaction to coin's (pendingTransactions)
    xCoin.addTransaction(tx1);

    // Mine the transaction
    console.log('\nStarting miner...');
    xCoin.minePendingTransactions('xaviers-address');
    console.log('\nBalance of xavier is ', xCoin.getBalanceOfAddress('xaviers-address'));

    // Start the miner again
    console.log('\Starting miner again...');
    xCoin.minePendingTransactions('xaviers-address');
    console.log('\nBalance of xavier is ', xCoin.getBalanceOfAddress('xaviers-address'));

    if (shouldTamper) {
        // do unauthorized modification 
        xCoin.chain[1].transactions[0].amount = 999999;
    }

    // Check validity of entire xCoin chain.
    console.log('Is chain valid?', xCoin.isChainValid());
}

testSigningTransaction(false);
