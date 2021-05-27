const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
var admin = require('firebase-admin');
var serviceAccount = require("./atlasplanner-e530e-firebase-adminsdk-dvqy8-b4c817c93b.json");
const { auth } = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://atlasplanner-e530e-default-rtdb.firebaseio.com"
  });

const MongoClient = require('mongodb').MongoClient
var mongo = require('mongodb');
const uri = "mongodb+srv://kimiakavanroodi:!@Ramz12@cluster0.5iqdk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const cors = require('cors');

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const userValidation = {

    getUID: async(token) => {
        try {
            return (await admin.auth().verifyIdToken(token)).uid.valueOf()
        } catch (error) {
            return null;
        }
    }
} 




app.get('/organizations',(req, res) => {
    const authHeader = req.headers.authorization

    userValidation.getUID(authHeader).then((_uid) => {
        if (_uid != null) {
            const collection = req.app.locals.db.collection("organizations");
            collection.find({'owner': _uid }).toArray(function(err, docs) {
                if (!err) {
                    res.status(200).json({ organizations : docs })
                }
            });
        } else {
            res.status(403).json({ error: 'invalid token' });
        }
    })
})


app.post('/organizations', (req, res) => {
    const authHeader = req.headers.authorization

    const name = req.body.name

    if (name == "") {
        res.status(400).json({ "error": "bad request"})
    }

    userValidation.getUID(authHeader).then((_uid) => {
        if (_uid != null) {
            const collection = req.app.locals.db.collection("organizations")
            collection.find({ '_id' : name }).toArray(function(err, docs) {
                if (docs) {
                    if (docs.length != 0) {
                        res.status(200).json({ "error": "organization name is taken."})
                    }
                }
            })

        const orgBody = {
            'name': name,
            '_id': name,
            'owner': _uid
        }

        collection.insertOne(orgBody).then((resp) => {
            const jsonBody = {}
            jsonBody["organization"] = orgBody
            res.status(200).send(jsonBody)
        })
    } else {
        res.status(403).json({ error: 'invalid token' });
        }
    })
})

app.delete('/organizations/:id', (req, res) => {
    const authHeader = req.headers.authorization

    const orgId = req.params.id;

    userValidation.getUID(authHeader).then((_uid) => {
        if (_uid != null) {
            return req.app.locals.collection('organizations').deleteOne({'_id': orgId, 'owner': _uid }).then(() => {
                res.status(204).send([])
            });
        } else {
            res.status(403).json({ error: 'invalid token' });
        }
    })
})


app.get('/organizations/:id', (req, res) => {
    const authHeader = req.headers.authorization

    const orgId = req.params.id

    userValidation.getUID(authHeader).then((_uid) => {
        if (_uid != null) {
            return req.app.locals.db.collection('organizations').find({"_id": orgId, 'owner': _uid }).toArray(function(err, docs) { 
                if (!err) {
                    if (docs.length != 0 && docs) {
                        const jsonBody = {}
                        jsonBody['organizations'] = docs
                        res.status(200).send(jsonBody)
                        res.end()
                    } else {
                        res.status(400).send('organization does not exist')
                    }
                }
            })
        } else {
            res.status(403).json({ error: 'invalid token' });
        }
    })
})


//events
app.get('/events/:orgId', (req, res) => {
    const authHeader = req.headers.authorization

    const orgId = req.params.orgId

    userValidation.getUID(authHeader).then((_uid) => {
        if (_uid != null) {
            return req.app.locals.db.collection('events').find({ "_orgId": orgId, 'owner': _uid }).toArray(function(err, docs) {
                if (docs == undefined) {
                    res.status(400).send([])
                    return;
                }
                if (!err) {
                    const jsonBody = {}
                    jsonBody["events"] = docs
                        res.status(200).send(jsonBody)
                    }
            })
        } else {
            res.status(403).json({ error: 'invalid token' });
        }
    })
})

app.delete('/events/:orgId', (req, res) => {
    const authHeader = req.headers.authorization

    const orgId = req.params.orgId

    userValidation.getUID(authHeader).then((_uid) => {
        if (_uid != null) {
            req.app.locals.db.collection('events').deleteMany({"_orgId": orgId, 'owner': _uid })
            req.app.locals.db.collection('sessions').deleteMany({"_orgId": orgId, 'owner': _uid })
            res.status(200).json({ error: 'event does not exist' });
        } else {
            res.status(403).json({ error: 'invalid token' });
        }
    })
})

app.get('/events/:orgId/:eventId', (req, res) => {

    const orgId = req.params.orgId
    const eventId = req.params.eventId

    return req.app.locals.db.collection('events').find({"_orgId": orgId, "name": eventId }).toArray(function(err, docs) { 
        if (docs && docs.length != 0) {
            if (!err) {
                const jsonBody = {}
                jsonBody["events"] = docs
                res.status(200).send(jsonBody)
                }
        } else {
            res.status(400).json({'error': 'event does not exist'});
        }
    })
})

app.post('/events/:orgId', (req, res) => {
    const authHeader = req.headers.authorization

    const orgId = req.params.orgId
    const eventName = req.body.name

    if (eventName == "") {
        res.status(400).json({ "error": "bad request"})
        return;
    }

    userValidation.getUID(authHeader).then((_uid) => {
        if (_uid != null) {
            const collection = req.app.locals.db.collection("events")
            collection.find({ 'name' : eventName, '_orgId': orgId }).toArray(function(err, docs) {
                if (docs) {
                    if (docs.length != 0) {
                        res.status(200).json({ "error": "event name is taken in your organization."})
                        return
                    } else {
                        const eventBody = {
                            '_orgId': orgId,
                            'name': eventName,
                            'owner': _uid,
                            'session_count': 0
                        }

                        
                        collection.insertOne(eventBody).then((resp) => {
                            const jsonBody = {}
                            jsonBody["event"] = eventBody
                            res.status(200).send(jsonBody)
                        })
                    }
                }
            })
        } else {
            res.status(403).json({ error: 'invalid token' });
        }
    })
})

app.get('/sessions/:orgId/:eventId', (req, res) => {
    
    const orgId = req.params.orgId
    const eventId = req.params.eventId

    if (req.body == "") {
        res.status(400).json({ "error": "bad request"})
    }

    const collection = req.app.locals.db.collection("sessions")
    const organizations = req.app.locals.db.collection("organizations")
    const events = req.app.locals.db.collection("events")

    organizations.find({ '_id': orgId }).toArray(function(err, docs) {
        if (docs.length != 0) {
            events.find({ '_orgId': orgId, 'name': eventId }).toArray(function(err, docEvents) {
                if (docEvents.length != 0) {
                    collection.find({ '_eventId' : eventId, '_orgId': orgId }).toArray(function(err, docs) {
                        const jsonBody = {}
                        jsonBody["sessions"] = docs
                        res.status(200).send(jsonBody)
                    })
            } else {
                res.status(200).json({ error: 'event does not exist' });
            }
        })
        } else {
            res.status(200).json({ error: 'organization does not exist' });
        }
    })
})

app.post('/sessions/:orgId/:eventId', (req, res) => {
    
    const orgId = req.params.orgId
    const eventId = req.params.eventId

    if (req.body == "") {
        res.status(400).json({ "error": "bad request"})
    }

    const collection = req.app.locals.db.collection("sessions")

    const sessionBody = {
        '_orgId': orgId,
        '_eventId': eventId,
        'name': req.body.name,
        'descriptions': req.body.descriptions,
        'section': req.body.section,
        'link': req.body.link,
        'timeslots': req.body.timeslots
    }

    collection.insertOne(sessionBody).then((resp) => {
        const jsonBody = {}
        jsonBody["sessions"] = sessionBody
        res.status(200).send(jsonBody)
    })
})

app.put('/sessions/:orgId/:eventId/:sessionId', (req, res) => {

    const sessionId = req.params.sessionId
    const session = req.body.session

    const obj_session = new mongo.ObjectID(sessionId)

    delete session["_id"]

    const collection = req.app.locals.db.collection("sessions")

    collection.replaceOne({'_id': obj_session }, session).then((resp) => {
        const jsonBody = {}
        jsonBody["sessions"] = session
        res.status(200).send(jsonBody)
    })
})

const PORT = process.env.PORT || 8080;

MongoClient.connect(uri, 'test', (err, db) => {
    if (err) {
      logger.warn(`Failed to connect to the database. ${err.stack}`);
    }
    app.locals.db = db.db('test');
    app.listen(PORT, () => {
      console.log(`Node.js app is listening at http://localhost:${PORT}`);
    });
});