const { Db } = require("mongodb");
const userValidation = require("../users/users");


const createEventDisplay = (req, res) => {
    const authHeader = req.headers.authorization

    const orgId = req.params.orgId
    const eventId = req.params.eventId

    const themeColor = req.body.theme_color
    const bannerColor = req.body.banner_color
    const logoURL = req.body.logo

    userValidation.getUID(authHeader).then((_uid) => {
        if (_uid != null) {
            req.app.locals.db.collection('events').find({"_orgId": orgId, "name": eventId, "owner": _uid }).toArray(function(err, docEvents) {
                if (docEvents.length != 0) {
                    const displayBody = {
                        _orgId: orgId,
                        _eventId: eventId,
                        theme_color: themeColor,
                        banner_color: bannerColor,
                        logo_URL: logoURL
                    }
                    req.app.locals.db.collection('display').insertOne(displayBody).then((resp) => {
                        res.status(200).send(displayBody)
                    })
                } else {
                    res.status(403).json({'error': 'event does not exist or you are not owner'});
                }
            })
        } else {
            res.status(403).json({ error: 'invalid token' });
        }
    })
};

const getEventDisplay = (req, res) => {
    const orgId = req.params.orgId
    const eventId = req.params.eventId
    console.log(orgId, eventId)

    req.app.locals.db.collection('display').find({"_orgId": orgId, "_eventId": eventId}).toArray(function(err, docs) { 
        if (docs && docs.length != 0) {
            if (!err) {
                const jsonBody = {}
                jsonBody["event_display"] = docs[0]
                res.status(200).send(jsonBody)
            }
        } else {
            res.status(403).json({'error': 'event display does not exist'});
        }
    })
};

const displayRoutes = {
    'createEventDisplay': createEventDisplay,
    'getEventDisplay': getEventDisplay,
}

module.exports = displayRoutes