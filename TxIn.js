module.exports = class TxIn {
    constructor(    
        txOutId,
        txOutIndex,
        signature
    ) {
        this.txOutId = txOutId
        this.txOutIndex = txOutIndex
        this.signature = signature
    }
};