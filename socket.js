

module.exports = function(io) {

    io.on('connection', function(socket) {
        var currentRoom = ""

        socket.on('sessions', function(data) {
            socket.join(data);            
        });

        socket.on('edit-sessions', function(data) {
            socket.join(data);            
        });

        socket.on('edit-sessions-users', function(data) {
            socket.join(data);
            currentRoom = data;
            var rooms = io.sockets.adapter.rooms.get(data).size
            io.in(data).emit('num_user_editing', rooms.toString())
        })

        socket.on('disconnecting', () => {
            if (currentRoom.length != 0) {
                var rooms = io.sockets.adapter.rooms.get(currentRoom).size
                io.in(currentRoom).emit('num_user_editing', rooms - 1)
            }
         });
    })

}
