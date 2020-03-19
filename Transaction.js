const SHA256 = require('crypto-js/sha256');

const Block = require('./Block');
const Blockchain = require('./Blockchain');

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

module.exports = class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    /**
     * Calc hash of Transaction, using fromAddress, toAddress, amount
     */
    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    /**
     * Sign a transaction given a signing key.
     * @param {} signingKey 
     */
    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    /**
     * isValid()
     */
    isValid() {
        // console.log(
        //     '\nisValid() ',
        //     '\nfromAddress', this.fromAddress, 
        //     '\nthis.signature', this.signature, 
        //     '\nthis.calculateHash()', this.calculateHash()
        // );

        if (this.fromAddress === null) {
            return true;
        }
        
        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }
        
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        const result = publicKey.verify(this.calculateHash(), this.signature);
        
        // console.log(
        //     '\npublicKey ', publicKey,
        //     '\nisValid result ', result
        // );

        return result;
    }
}