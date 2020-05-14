var request = require('request');

module.exports = class TransactionSender {
    sendTransactionToNeighbors(transaction, neighborNodeList) {
        console.log('send Transaction To Neighbors - Transaction: ', transaction, ',\n neightborNodeList: ', neighborNodeList);
        neighborNodeList.forEach(neighborNode => {
            try {
                request.post(
                    `${neighborNode}/transaction`, 
                    {
                        json: transaction
                    }
                ).on('error', function(err) {
                    console.error(err)
                });
            } catch (exception) {
                console.error(exception);
            }
        });
    }
};