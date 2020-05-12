const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

module.exports = class SignatureUtils {
    signHash(keyPair, messageHash) {
        let signature = keyPair.sign(messageHash).toString().toLowerCase();
        console.debug(`Signature: \n${signature}`);
        return signature;
    }
    
    verifySignature(publicKey, signature, messageHash) {
        let key = ec.keyFromPublic(publicKey, 'hex');
        let verified = key.verify(messageHash, signature);
        console.debug(`Verified: ${verified}`);
        return verified;
    }
    
    toHex(data) {
        return elliptic.utils.toHex(data);
    }
}
