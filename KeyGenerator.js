/*
 * Demo basic Key Generation
 */
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

// debug
// console.log('Private Key:', privateKey);
// console.log('Public Key:', publicKey);