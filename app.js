const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
var admin = require('firebase-admin');

var serviceAccount = require("/Users/kimiakavanroodi/Desktop/Node_API/atlasplanner-e530e-firebase-adminsdk-dvqy8-b4c817c93b.json");
const { auth } = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://atlasplanner-e530e-default-rtdb.firebaseio.com"
  });

const MongoClient = require('mongodb').MongoClient
var mongo = require('mongodb');
const uri = "mongodb+srv://kimiakavanroodi:!@Ramz12@cluster0.5iqdk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = client.connect() // initialized connection


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
            connection.then(err => {
                const collection = client.db("test").collection("organizations");
                collection.find({'owner': _uid }).toArray(function(err, docs) {
                    if (!err) {
                        res.status(200).json({ organizations : docs })
                    }
                });
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
            connection.then(err => {
                const collection = client.db("test").collection("organizations")
                collection.find({ '_id' : name }).toArray(function(err, docs) {
                    if (docs) {
                        if (docs.length != 0) {
                            res.status(400).json({ "error": "organization name is taken."})
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
            connection.then(() => {
                return client.db('test').collection('organizations').deleteOne({'_id': orgId, 'owner': _uid }).then(() => {
                    res.status(204).send([])
                });
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
            connection.then(() => {
                return client.db('test').collection('organizations').find({"_id": orgId, 'owner': _uid }).toArray(function(err, docs) { 
                    if (!err) {
                        const jsonBody = {}
                        jsonBody['organizations'] = docs
                        res.status(200).send(jsonBody)
                        res.end()
                    }
                })
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
            client.connect().then(() => {
                return client.db('test').collection('events').find({ "_orgId": orgId, 'owner': _uid }).toArray(function(err, docs) {
                    console.log(docs) 
                if (docs == undefined) {
                    res.status(400).send([])
                }
                if (!err) {
                    const jsonBody = {}
                    jsonBody["events"] = docs
                        res.status(200).send(jsonBody)
                    }
                })
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
            client.connect().then(() => {
                client.db('test').collection('events').deleteMany({"_orgId": orgId, 'owner': _uid })
                client.db('test').collection('sessions').deleteMany({"_orgId": orgId, 'owner': _uid })
                res.status(204).send([])
            })
        } else {
            res.status(403).json({ error: 'invalid token' });
        }
    })
})

app.get('/events/:orgId/:eventId', (req, res) => {

    const orgId = req.params.orgId
    const eventId = req.params.eventId

    client.connect().then(() => {
        return client.db('test').collection('events').find({"_orgId": orgId, "name": eventId }).toArray(function(err, docs) { 
            if (docs) {
                if (!err) {
                    const jsonBody = {}
                    jsonBody["events"] = docs
                    res.status(200).send(jsonBody)
                  }
            } else {
                res.status(400).send([])
            }
      })
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
            connection.then(err => {
                const collection = client.db("test").collection("events")
                collection.find({ 'name' : eventName, '_orgId': orgId }).toArray(function(err, docs) {
                    if (docs) {
                        if (docs.length != 0) {
                            res.status(400).json({ "error": "event name is taken in your organization."})
                        }
                    }
                })

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

    connection.then(err => {
        const collection = client.db("test").collection("sessions")
        const organizations = client.db("test").collection("organizations")
        const events = client.db("test").collection("events")

        organizations.find({ '_orgId': orgId }).toArray(function(err, docs) {
            console.log(docs.length)
            if (docs.length == 0) {
                console.log('got here')
                events.find({ '_orgId': orgId, 'name': eventId }).toArray(function(err, docEvents) {
                    if (docEvents.length != 0) {
                        collection.find({ '_eventId' : eventId, '_orgId': orgId }).toArray(function(err, docs) {
                            const jsonBody = {}
                            jsonBody["sessions"] = docs
                            res.status(200).send(jsonBody)
                        })
                } else {
                    res.status(400).json({ error: 'event does not exist' });
                }
            })
            } else {
                res.status(400).json({ error: 'organization does not exist' });
            }
        }) 
    })
})

app.post('/sessions/:orgId/:eventId', (req, res) => {
    
    const orgId = req.params.orgId
    const eventId = req.params.eventId

    if (req.body == "") {
        res.status(400).json({ "error": "bad request"})
    }

    connection.then(err => {
        const collection = client.db("test").collection("sessions")

        const sessionBody = {
            '_orgId': orgId,
            '_eventId': eventId,
            'name': req.body.name,
            'descriptions': req.body.descriptions,
            'section': req.body.section,
            'timeslots': req.body.timeslots
        }

        collection.insertOne(sessionBody).then((resp) => {
            const jsonBody = {}
            jsonBody["sessions"] = sessionBody
            res.status(200).send(jsonBody)
        })
    })
})

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})