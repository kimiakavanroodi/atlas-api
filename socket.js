

module.exports = function(io) {
    io.on('connection', function(socket) {

        socket.on('sessions', function(data) {
            socket.join(data);            
        })

    })
}
