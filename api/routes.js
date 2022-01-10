const express = require("express");
const orgRoutes = require("./organizations/organizations");
const cors = require('cors');
const eventRoutes = require("./events/events");
const sessionsRoutes = require("./sessions/sessions");
const keyRoutes = require("./keys/keys");
const bookings = require("./bookings/bookings");
const displayRoutes = require("./display/displays");

module.exports = function(app) {
    app.use(express.json());
    app.use(cors())

    app.get("/organizations", orgRoutes['getAllOrganizations']);
    app.get("/organizations/:id", orgRoutes['getOrganization']);
    app.post("/organizations", orgRoutes['createOrganization']);
    app.delete('/organizations/:id', orgRoutes['deleteOrganization']);
    
    app.get('/events/:orgId', eventRoutes['getAllEvents'])
    app.get('/events/is-owner/:orgId/:eventId', eventRoutes['isEventOwner'])
    app.get('/events/:orgId/:eventId', eventRoutes['getEvent'])
    app.post('/events/:orgId', eventRoutes['createEvent'])
    app.delete('/events/:orgId/:eventId', eventRoutes['deleteEvent'])
    app.put('/events/:orgId/:eventId', eventRoutes['updateEvent'])

    app.get('/sessions/:orgId/:eventId/:sessionId', sessionsRoutes['getSession'])
    app.get('/sessions/:orgId/:eventId', sessionsRoutes['getAllSessions'])
    app.post('/bulk-sessions/:orgId/:eventId', sessionsRoutes['createBulkSession'])
    app.post('/sessions/:orgId/:eventId', sessionsRoutes['createSession'])
    app.put('/sessions/:orgId/:eventId/:sessionId', sessionsRoutes['updateSession'])
    app.delete('/sessions/:orgId/:eventId/:sessionId', sessionsRoutes['deleteSession'])

    app.post('/display/:orgId/:eventId', displayRoutes['createEventDisplay'])
    app.get('/display/:orgId/:eventId', displayRoutes['getEventDisplay'])

    app.post('/keys/:orgId/:eventId', keyRoutes['createKey']) 
    app.get('/keys/:orgId/:eventId', keyRoutes['getKey'])
    app.put('/keys/:orgId/:eventId', keyRoutes['updateKey'])

    app.delete('/bookings/:orgId/:eventId/:sessionId/:bookingId', bookings['deleteBooking']) 

    app.get('/event-exists/:orgId/:eventId', eventRoutes['eventExists'])
    app.get('/session-exists/:orgId/:eventId/:sessionId', sessionsRoutes['sessionExists']) 

};