const userValidation = require("../users/users");

const getAllOrganizations = (req, res) => {
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
}

const getOrganization = (req, res) => {
    const authHeader = req.headers.authorization

    const orgId = req.params.id

    userValidation.getUID(authHeader).then((_uid) => {
        if (_uid != null) {
            req.app.locals.db.collection('organizations').find({"_id": orgId, 'owner': _uid }).toArray(function(err, docs) { 
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
};


const createOrganization = (req, res) => {
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
}

const deleteOrganization = (req, res) => {
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
}

const orgRoutes = {
    'getAllOrganizations': getAllOrganizations,
    'getOrganization': getOrganization,
    'createOrganization': createOrganization,
    'deleteOrganization': deleteOrganization
}

module.exports = orgRoutes
