const SHA256 = require('crypto-js/sha256');

const Block = require('./Block');
const Blockchain = require('./Blockchain');

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const COINBASE_AMOUNT = 50;

module.exports = class Transaction {
    constructor(fromAddress, toAddress, amount, id, txIns, txOuts) {
        this.id = id;
        this.txIns = txIns;
        this.txOuts = txOuts;
        
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;

        // transaction is signed sometime later.
        this.signature = null; 
    }

    /**
     * calculated by taking a hash from the contents of the transaction.
     * However, the signatures of the txIds are not included in the transaction hash as the will be
     * added later on to the transaction.
     * @param {*} transaction 
     */
    getTransactionId (isCoinbaseTransaction = false, blockHeight = '') {
        const txInContent = this.txIns
            .map((txIn) => txIn.txOutId + txIn.txOutIndex)
            .reduce((a, b) => a + b, '');

        const txOutContent = this.txOuts
            .map((txOut) => txOut.address + txOut.amount)
            .reduce((a, b) => a + b, '');

        const hashContent = txInContent + 
            txOutContent + 
            (isCoinbaseTransaction ? blockHeight : '');
        
        return SHA256(hashContent).toString();
    };

    /**
     * Calc hash of Transaction, using fromAddress, toAddress, amount
     */
    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    calculateHashV2() {
        const anyString = typeof (this) == 'object' ? 
            JSON.stringify(this) : this.toString();

        const hash = SHA256(anyString).toString();
        
        return hash;
    }

    /**
     * Sign a transaction given a signing key.
     * @param {} signingKey 
     */
    signTransaction(signingKey) {
        console.log(`signTransaction: \n${signingKey.getPublic('hex')}    \n${this.fromAddress}`);
        console.log(`signTransaction: Public key === address \n${signingKey.getPublic('hex') === this.fromAddress}`);

        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
        return this.signature;
    }

    /**
     * is Valid
     */
    isValid() {
        console.log(
            '\nisValid() ',
            '\nfromAddress', this.fromAddress, 
            '\n(this.fromAddress === null) ', (this.fromAddress === null),
            '\nthis.signature', this.signature, 
            '\nthis.calculateHash()', this.calculateHash()
        );

        if (this.fromAddress === null) {
            return true;
        }
        
        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }
        
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        const result = publicKey.verify(this.calculateHash(), this.signature);
        
        console.log(
            // '\npublicKey ', publicKey,
            '\nisValid result ', result
        );

        return result;
    }
}