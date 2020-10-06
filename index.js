const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');

app.set('view engine', 'ejs');

const url = 'mongodb://admin1:admin@ec2-18-217-11-83.us-east-2.compute.amazonaws.com:27017/counter_db?authMechanism=SCRAM-SHA-1';
let globalCount = 0;

async function updateCounter(client) {
    database = await client.db('counter_db'); 

    const doc = await database.collection('incoming_requests').find({}).toArray();
    if (doc && doc.length) {
        const id = doc[0]._id;
        globalCount++;

        await database.collection('incoming_requests').updateOne({'_id': id}, {$set: {count: globalCount}});
    } else {
        database.collection('incoming_requests').insertOne({count: 0});
    }
    
}

async function main() {
    const client = new MongoClient(url, { useUnifiedTopology: true });

    try {
        await client.connect();     

        app.get('/', async function(req, res) {
            await updateCounter(client);
            res.render('index', {
                counter: globalCount
            });
        });
        
        app.listen(3000, function() {
            console.log('App listening on port 3000!');
        });
 
    } catch (e) {
        console.log(e);
    }
}

main();