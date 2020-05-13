var request = require('request');

module.exports = class TransactionSender {
    sendTransactionToNeighbors(transaction, neighborNodeList) {
        console.log('send Transaction To Neighbors - Transaction: ', transaction, ', neightborNodeList: ', neighborNodeList);
        neighborNodeList.forEach(neighborNode => {
            request.post(
                'http://127.0.0.1:8882/transaction', 
                // todo convert blockchain to sendable
                transaction
            );
        });
    }
};