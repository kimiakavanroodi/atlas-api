const { updateSession } = require("../sessions/sessions");
const userValidation = require("../users/users");

const createKey = (req, res) => {
    const authHeader = req.headers.authorization

    const key = req.body.key
    const orgId = req.params.orgId
    const eventId = req.params.eventId

    const keyCollection = req.app.locals.db.collection("keys")
    const orgCollection = req.app.locals.db.collection("organizations")

    userValidation.getUID(authHeader).then((_uid) => {
        if (_uid != null) {
            orgCollection.find({ "_id": orgId, 'owner': _uid }).toArray(function(err, docEvents) {
                if (docEvents.length != 0) {
                    const keyBody = {
                        "_orgId": orgId,
                        "_eventName": eventId,
                        'owner': _uid,
                        "key": key
                    }        
                    keyCollection.insertOne(keyBody).then((resp) => {
                        const jsonBody = {}
                        jsonBody["key"] = keyBody
                        res.status(200).send(jsonBody)
                    })
                } else {
                    res.status(403).json({ error: 'Something deceptive is happening...you are not the owner.' });
                }
            })
        } else {
            res.status(403).json({ error: 'invalid token' });
        }
    })
}

const getKey = (req, res) => {
    const authHeader = req.headers.authorization

    const orgId = req.params.orgId
    const eventId = req.params.eventId

    userValidation.getUID(authHeader).then((_uid) => {
        if (_uid != null) {
            req.app.locals.db.collection('keys').find({"_orgId": orgId, 'owner': _uid, '_eventName': eventId }).toArray(function(err, keys) {
                const jsonBody = {}
                jsonBody["key"] = keys[0]
                res.status(200).send(jsonBody)
            })
        } else {
            res.status(403).json({ error: 'invalid token' });
        }
    })
}

const updateKey = (req, res) => {
    const authHeader = req.headers.authorization

    const orgId = req.params.orgId
    const eventId = req.params.eventId
    const key = req.body.key

    userValidation.getUID(authHeader).then((_uid) => {
        if (_uid != null) {
            req.app.locals.db.collection('keys').replaceOne({"_orgId": orgId, 'owner': _uid, '_eventName': eventId }, {"_orgId": orgId, 'owner': _uid, '_eventName': eventId, 'key': key } ).then(() => {
                const jsonBody = {}
                jsonBody["key"] = {"_orgId": orgId, 'owner': _uid, '_eventName': eventId, 'key': key }
                res.status(200).send(jsonBody)
            })
        } else {
            res.status(403).json({ error: 'invalid token' });
        }
    })
}

const keyRoutes = {
    'createKey': createKey,
    'getKey': getKey,
    'updateKey': updateKey
}

module.exports = keyRoutes

