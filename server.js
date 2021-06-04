const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const http = require('http').Server(app);
var admin = require('firebase-admin');
const io = require('socket.io')(http, {
    cors: {
        origin: '*',
    }
});
require('./socket')(io)

const MongoClient = require('mongodb').MongoClient
const config = require('./config/config');

app.set('socketio', io)

require('./api/routes')(app);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const PORT = process.env.PORT || 8080;

config.getConfig('MONGO_URI').then((uri) => {
    MongoClient.connect(uri, 'test', async(err, db) => {
        if (err) {
            logger.warn(`Failed to connect to the database. ${err.stack}`);
        }

        app.locals.db = db.db('test');

        var serviceAccount = await config.getConfig('GOOGLE_SA');
        var databaseURL = await config.getConfig('FB_DB')

        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(serviceAccount)),
            databaseURL: databaseURL
        });

        http.listen(PORT, () => {
            console.log(`Node.js app is listening at http://localhost:${PORT}`);
        });
    });
})