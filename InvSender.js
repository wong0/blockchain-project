var request = require('request');

module.exports = class InvSender {
    sendInvToNeighbors(myBlockchain, neighborNodeList) {
        console.log('sendInvToNeighbors', myBlockchain, neighborNodeList);
        neighborNodeList.forEach(neighborNode => {
            try {
                request.post(
                    `${neighborNode}/inv`, 
                    // convert blockchain to sendable
                    {
                        json: myBlockchain
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
