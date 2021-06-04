const express = require("express");
const orgRoutes = require("./organizations/organizations");
const cors = require('cors');
const eventRoutes = require("./events/events");
const sessionsRoutes = require("./sessions/sessions");
const keyRoutes = require("./keys/keys");

module.exports = function(app) {
    app.use(express.json());
    app.use(cors())

    app.get("/organizations", orgRoutes['getAllOrganizations']);
    app.get("/organizations/:id", orgRoutes['getOrganization']);
    app.post("/organizations", orgRoutes['createOrganization']);
    app.delete('/organizations/:id', orgRoutes['deleteOrganization']);
    
    app.get('/events/:orgId', eventRoutes['getAllEvents'])
    app.get('/events/:orgId/:eventId', eventRoutes['getEvent'])
    app.post('/events/:orgId', eventRoutes['createEvent'])
    app.delete('/events/:orgId/:eventId', eventRoutes['deleteEvent'])

    app.get('/sessions/:orgId/:eventId', sessionsRoutes['getAllSessions'])
    app.post('/sessions/:orgId/:eventId', sessionsRoutes['createSession'])
    app.put('/sessions/:orgId/:eventId/:sessionId', sessionsRoutes['updateSession'])
    app.delete('/sessions/:orgId/:eventId/:sessionId', sessionsRoutes['deleteSession'])

    app.post('/keys/:orgId/:eventId', keyRoutes['createKey']) 
    app.get('/keys/:orgId/:eventId', keyRoutes['getKey'])
    app.put('/keys/:orgId/:eventId', keyRoutes['updateKey'])
};