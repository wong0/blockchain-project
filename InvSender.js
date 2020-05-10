var request = require('request');

module.exports = class InvSender {
    sendInvToNeighbors(myBlockchain, neighborNodeList) {
        console.log('sendInvToNeighbors', myBlockchain, neighborNodeList);
        neighborNodeList.forEach(neighborNode => {
            request.post(
                'http://127.0.0.1:8882/inv', 
                // todo convert blockchain to sendable
                myBlockchain
            );
        });
    }
};