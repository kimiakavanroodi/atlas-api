var mongo = require('mongodb');


const deleteBooking = (req, res) => {
    let orgId = req.params.orgId
    let eventId = req.params.eventId
    let sessionId = new mongo.ObjectID(req.params.sessionId)
    let bookingId = req.params.bookingId

    const io = req.app.get('socketio')
    const collection = req.app.locals.db.collection("sessions")

    collection.find({"_orgId": orgId, '_eventId': eventId, '_id': sessionId }).toArray(function(err, docs) {
        if (docs.length != 0) {
            docs[0]["timeslots"].map((slot) => {
                if (slot["filled"][bookingId]) {
                    delete slot["filled"][bookingId]
                    collection.replaceOne({'_id': sessionId }, docs[0])
                }
            })
            io.in(orgId + "-" + eventId + "-edit-sessions").in(orgId + "-" + eventId + "-sessions").emit('UPDATED_SESSION', docs[0]);
            res.status(200).send([])
        } else {
            res.status(400).send([])
        }
    })
}


module.exports = {
    "deleteBooking": deleteBooking
}