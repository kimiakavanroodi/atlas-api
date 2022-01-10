const { Db } = require("mongodb");
const userValidation = require("../users/users");


const eventExists = (req, res) => {
    let eventId = req.params.eventId
    let orgId = req.params.orgId

    console.log(eventId)

    let events = req.app.locals.db.collection('events')

    events.find({ "_orgId": orgId, 'name': eventId }).toArray(function(err, docs) {
        if (docs.length != 0) {
            res.status(200).send(true)
            return;
        } else {
            res.status(200).send(false)
            return;
        }
    })
}

const getAllEvents = (req, res) => {
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
}

const isEventOwner = (req, res) => {
    const authHeader = req.headers.authorization

    const orgId = req.params.orgId
    const eventId = req.params.eventId

    userValidation.getUID(authHeader).then((_uid) => {
        if (_uid != null) {
            req.app.locals.db.collection('events').find({"_orgId": orgId, "name": eventId, "owner": _uid }).toArray(function(err, docs) { 
                if (docs && docs.length != 0) {
                    console.log('event')
                    res.status(200).send(true)
                } else {
                    res.status(403).json(false);
                }
            })
        } else {
            res.status(403).json(false);
        }
    })

};

const getEvent = (req, res) => {
    const authHeader = req.headers.authorization

    const orgId = req.params.orgId
    const eventId = req.params.eventId

    userValidation.getUID(authHeader).then((_uid) => {
        if (_uid != null) {
            req.app.locals.db.collection('events').find({"_orgId": orgId, "name": eventId, "owner": _uid }).toArray(function(err, docs) { 
                if (docs && docs.length != 0) {
                    if (!err) {
                        const jsonBody = {}
                        jsonBody["events"] = docs
                        res.status(200).send(jsonBody)
                    }
                } else {
                    res.status(403).json({'error': 'event does not exist'});
                }
            })
        } else {
            res.status(403).json({ error: 'invalid token' });
        }
    })
}


const createEvent = (req, res) => {
    const authHeader = req.headers.authorization

    const orgId = req.params.orgId
    const eventName = req.body.name
    const description = req.body.description 
    const instruction = req.body.instruction
    const theme_color = req.body.theme_color
    const bannerColor = req.body.banner_color

    if (eventName == "") {
        res.status(400).json({ "error": "bad request"})
        return;
    }

    userValidation.getUID(authHeader).then((_uid) => {
        if (_uid != null) {
            const collection = req.app.locals.db.collection("events")
            collection.find({ 'name' : eventName, '_orgId': orgId,  }).toArray(function(err, docs) {
                if (docs) {
                    if (docs.length != 0) {
                        res.status(200).json({ "error": "event name is taken in your organization."})
                        return
                    } else {
                        const eventBody = {
                            '_orgId': orgId,
                            'name': eventName,
                            'owner': _uid,
                            'instruction': instruction,
                            'description': description,
                            'theme_color': theme_color,
                            'banner_color': bannerColor
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
}


const deleteEvent = (req, res) => {
    const authHeader = req.headers.authorization

    const orgId = req.params.orgId
    const eventId = req.params.eventId

    userValidation.getUID(authHeader).then((_uid) => {
        if (_uid != null) {
            req.app.locals.db.collection('organizations').find({ "_id": orgId, 'owner': _uid }).toArray(function(err, docEvents) {
                if (docEvents.length != 0) {
                    req.app.locals.db.collection('events').deleteMany({"_orgId": orgId, 'name': eventId, 'owner': _uid })
                    req.app.locals.db.collection('sessions').deleteMany({"_orgId": orgId, '_eventId': eventId })
                    req.app.locals.db.collection('keys').deleteMany({"_orgId": orgId, 'owner': _uid, '_eventName': eventId })
                    res.status(200).json({message: 'Successfully deleted event.'});
                } else {
                    res.status(403).json({ error: 'Not the owner of this organization or incorrect orgId.' });
                }
            }) 
        } else {
            res.status(403).json({ error: 'invalid token' });
        }
    })
}

const updateEvent = (req, res) => {
    const authHeader = req.headers.authorization

    const orgId = req.params.orgId
    const eventId = req.params.eventId

    const eventBody = req.body.event

    userValidation.getUID(authHeader).then((_uid) => {
        if (_uid != null) {
            eventBody["owner"] = _uid
            req.app.locals.db.collection('events').find({"_orgId": orgId, "name": eventId, "owner": _uid }).toArray(function(err, docEvents) {
                if (docEvents.length != 0) {
                    req.app.locals.db.collection('events').replaceOne({"_orgId": orgId, "name": eventId, "owner": _uid }, eventBody).then(() => {
                        const jsonBody = {}
                        jsonBody["event"] = eventBody
                        res.status(200).send(jsonBody)
                    })
                } else {
                    res.status(403).json({ error: 'event does not exist.' });
                }
            }) 
        } else {
            res.status(403).json({ error: 'invalid token' });
        }
    })
}


const eventRoutes = {
    'getAllEvents': getAllEvents,
    'getEvent': getEvent,
    'isEventOwner': isEventOwner,
    'eventExists': eventExists,
    'createEvent': createEvent,
    'deleteEvent': deleteEvent,
    'updateEvent': updateEvent
}

module.exports = eventRoutes