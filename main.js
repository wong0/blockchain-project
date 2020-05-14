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
    
    xcoin.addBlock(new Block("17/03/2020", { amount: 4 }, ''));
    
    console.log('Mining block 2...');
    
    xcoin.addBlock(new Block("17/03/2020", { amount: 8 }, ''));
}
// testMiningBasic();

const Transaction = require('./Transaction');

/**
 * Test that successful mining of a block is rewarded
 */
function testMiningBalance() {
    let xCoin = new Blockchain();

    // Create a transaction from address 1 to 2 of 100
    xCoin.createTransaction(new Transaction('address1', 'address2', 100));

    // Create transaction from address 2 to 1 of 50
    xCoin.createTransaction(new Transaction('address2', 'address1', 50));    

    console.log('\n Starting the miner...');
    xCoin.minePendingTransactions('xaviers-address');
    
    console.log('\nBalance of xavier is', xCoin.getBalanceOfAddress('xaviers-address'));
    
    console.log('\n Starting the miner 2nd time...');
    xCoin.minePendingTransactions('xaviers-address');
    
    console.log('\nBalance of xavier is', xCoin.getBalanceOfAddress('xaviers-address'));

    console.log('-------')
    
}

// testMiningBalance()

/**
 * Demo 4 
 * testSigningTransaction
 * Test that a transaction can be signed, 
 * so that unauthorized modification to the transaction is detectable.
 */
function testSigningTransaction(shouldTamper) {
    // Create key
    const myKey = ec.keyFromPrivate('dnsfhai2ibrb2jknjxcvniuwea')
    
    // Create Wallet address
    const myWalletAddress = myKey.getPublic('hex');

    // Create KeyPair
    const keyPair = ec.genKeyPair();
    console.log('My KeyPair is ', keyPair.getPublic(), ' (public) , ', keyPair.getPrivate(), ' (private)');

    // Initialize Blockchain
    console.log('Initialize Blockchain');
    let xCoin = new Blockchain(keyPair);
    console.log('xCoin ', xCoin);

    // Create a transaction
    console.log('Create a transaction: \n');
    const tx1 = new Transaction(myWalletAddress, 'receiver', 10, 0)

    // Sign the transaction
    console.log('Sign a transaction: \n');

    tx1.signTransaction(myKey);
    // Add transaction to coin's (pendingTransactions)
    xCoin.addTransaction(tx1);

    // Mine the transaction
    console.log('\nMine pending transactions, rewarding xaviers-address ...');
    xCoin.minePendingTransactions('xaviers-address');
    console.log('\nBalance of xavier is ', xCoin.getBalanceOfAddress('xaviers-address'));

    // Start the miner again
    console.log('\nMine pending transactions, rewarding xaviers-address');
    xCoin.minePendingTransactions('xaviers-address');
    console.log('\nBalance of xavier is ', xCoin.getBalanceOfAddress('xaviers-address'), '\n');

    if (shouldTamper) {
        // do unauthorized modification 
        xCoin.chain[1].transactions[0].amount = 999999;
    }

    console.log('Balance of myWalletAddress (sender address) : ', xCoin.getBalanceOfAddress(myWalletAddress), '\n');
    console.log('Balance of receiver Address : ', xCoin.getBalanceOfAddress('public key'), '\n');
    console.log('Printout of xCoin whole blockchain : \n', xCoin.chain, '\n');

    console.log('\n--------------------------\nAdd another transaction...\n');

    // Create a transaction
    console.log('\nCreate tx2 Transaction ...');
    const tx2 = new Transaction(myWalletAddress, 'public key', 20, 1);

    // Sign the tx2 transaction
    console.log('\nSign Transaction with my key');
    tx2.signTransaction(myKey);
    // Add transaction to coin's (pendingTransactions)
    xCoin.addTransaction(tx2);

    // Mine the tx2 transaction
    console.log('\nMine pending transactions, rewarding xaviers-address');
    xCoin.minePendingTransactions('xaviers-address');
    console.log('\nBalance of xavier is ', xCoin.getBalanceOfAddress('xaviers-address'));
    
    console.log('Balance of myWalletAddress : ', xCoin.getBalanceOfAddress(myWalletAddress), '');
    console.log('Balance of "public key" Address : ', xCoin.getBalanceOfAddress('public key'), '');
    console.log('Printout of xCoin whole blockchain : ', xCoin.chain);

    // Check validity of entire xCoin chain.
    console.log('Is chain valid?', xCoin.isChainValid());
}

testSigningTransaction(false);
