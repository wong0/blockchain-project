// Storage dependencies - Mongo 
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";
const dbName = "blockchain-coin-db";
const dbCollectionName = "blockchain";

module.exports = class BlockchainSaver {
    saveBlockchainToDisk(blockchain) {
        // TODO save blockchain to disk
        
        // 1. connect db
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db(dbName);
    
            // 2. Clear out everything in blockchain
            dbo.collection(dbCollectionName).deleteMany(function(err, delOK) {
                if (err) throw err;
                if (delOK) console.log("Collection removed");
            });
    
            // 3. Create blockchain into db
            dbo.createCollection(dbCollectionName, function(err, res) {
                if (err) throw err;
                console.log(`Collection '${dbCollectionName}' created!`);
            });
            
            // 4. Add each block of blockchain into collection
            // dbo.collection(dbCollectionName).insertMany([{
            //     "a": "b"
            // }, {
            //     "a": "b"
            // }], 
            // function(err, res) {
            //     if (err) throw err;
            //     console.log("Number of documents inserted: " + res.insertedCount);
            //     db.close();
            // });
            db.close();
        });
    }
}
