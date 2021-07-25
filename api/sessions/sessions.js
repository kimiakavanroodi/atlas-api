
var mongo = require('mongodb');
const userValidation = require("../users/users");
const express = require('express')
const app = express()

const sessionExists = (req, res) => {
    
    let orgId = req.params.orgId
    let eventId = req.params.eventId
    let sessionId = new mongo.ObjectID(req.params.sessionId)

    const sessions = req.app.locals.db.collection("sessions")

    sessions.find({ '_eventId' : eventId, '_orgId': orgId, '_id': sessionId }).toArray(function(err, docEvents) {
        if (docEvents.length != 0) {
            res.status(200).send(docEvents[0])
        } else {
            res.status(200).send(false)
        }
    })
}

const getAllSessions = (req, res) => {
    
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
                        jsonBody['event_info'] = {}
                        jsonBody['event_info']['description'] = docEvents[0]['description']
                        jsonBody['event_info']['instruction'] = docEvents[0]['instruction']
                        jsonBody["sessions"] = docs
                        res.status(200).send(jsonBody)
                    })
            } else {
                res.status(403).json({ error: 'event does not exist' });
            }
        })
        } else {
            res.status(403).json({ error: 'organization does not exist' });
        }
    })
}

const createSession = (req, res) => {
    
    const orgId = req.params.orgId
    const eventId = req.params.eventId
    const key = req.body.key

    if (req.body == "") {
        res.status(400).json({ "error": "bad request"})
    }

    const keyCollection = req.app.locals.db.collection("keys")
    const collection = req.app.locals.db.collection("sessions")

    const sessionBody = {
        '_orgId': orgId,
        '_eventId': eventId,
        'category': req.body.category,
        'name': req.body.name,
        'email': req.body.email,
        'descriptions': req.body.descriptions,
        'section': req.body.section,
        'link': req.body.link,
        'timeslots': req.body.timeslots,
        'box_a': req.body.box_a,
        'box_b': req.body.box_b,
        'box_c': req.body.box_c
    }

    const io = req.app.get('socketio')
    keyCollection.find({ '_orgId': orgId, '_eventName': eventId, 'key': key  }).toArray(function(err, docKeys) {
        if (docKeys.length != 0) {
            collection.insertOne(sessionBody).then((doc) => {

                const jsonBody = {}
                sessionBody["_id"] = doc.insertedId
                jsonBody["sessions"] = sessionBody
                res.status(200).send(jsonBody)
                io.in(sessionBody['_orgId'] + "-" + sessionBody["_eventId"] + "-edit-sessions").in(sessionBody['_orgId'] + "-" + sessionBody["_eventId"] + "-sessions").emit('ADDED_SESSION', sessionBody);
         
                })
        } else {
            res.status(403).json({ "error": "key is incorrect"})
        }
    })
}

const getSession = (req, res) => {
    const orgId = req.params.orgId
    const eventId = req.params.eventId
    const obj_session = new mongo.ObjectID(req.params.sessionId)

    const sessions = req.app.locals.db.collection("sessions")

    sessions.find({ '_eventId' : eventId, '_orgId': orgId, '_id': obj_session}).toArray(function(err, docs) {
        if (docs.length != 0) {
            res.status(200).send(docs)
        } else {
            res.status(400).send([])
        }
    })
};

const updateSession = (req, res) => {

    const sessionId = req.params.sessionId
    const session = req.body.session

    const obj_session = new mongo.ObjectID(sessionId)

    delete session["_id"]

    const collection = req.app.locals.db.collection("sessions")

    const io = req.app.get('socketio')

    collection.replaceOne({'_id': obj_session }, session).then((resp) => {
        const jsonBody = {}
        
        jsonBody["sessions"] = session
        session["_id"] = sessionId
        res.status(200).send(jsonBody)

        
        io.in(session['_orgId'] + "-" + session["_eventId"] + "-edit-sessions").in(session['_orgId'] + "-" + session["_eventId"] + "-sessions").emit('UPDATED_SESSION', session);
    })
}

const deleteSession = (req, res) => {

    const sessionId = req.params.sessionId
    const orgId = req.params.orgId
    const eventId = req.params.eventId
    const key = req.headers.data;

    const obj_session = new mongo.ObjectID(sessionId)

    const sessionCollection = req.app.locals.db.collection("sessions")
    const keyCollection = req.app.locals.db.collection("keys")

    const io = req.app.get('socketio')

    keyCollection.find({ '_orgId': orgId, '_eventName': eventId, 'key': key  }).toArray(function(err, docKeys) {
        if (docKeys.length != 0) {
            sessionCollection.deleteOne({'_id': obj_session }).then((resp) => {
                const jsonBody = {}
                jsonBody["_id"] = sessionId
                res.status(200).send(jsonBody)
                io.in(orgId  + "-" + eventId + "-edit-sessions").in(orgId  + "-" + eventId + "-sessions").emit('DELETED_SESSION', sessionId);
            })
        } else {
            res.status(403).json({ "error": "key is incorrect"})
        }
    })
}

const sessionsRoutes = {
    'getAllSessions': getAllSessions,
    'createSession': createSession,
    'updateSession': updateSession,
    'deleteSession': deleteSession,
    'sessionExists': sessionExists,
    'getSession': getSession
}

module.exports = sessionsRoutes