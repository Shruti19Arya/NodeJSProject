
const path = require('path'); // importing path module             
const http = require('http');

const express = require('express');  // importing express
const socketio = require('socket.io'); // importing socket.io
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;


//Set public folder as static folder. So, u can access html,css,js files
app.use(express.static(path.join(__dirname, 'public')));

const Notification = 'Notification';

// Run when a client connects
io.on('connection', socket => {

        socket.on('joinRoom', ({ username, room }) => {

                const user = userJoin(socket.id, username, room);
                socket.join(user.room);

                //Welcome current user
                // emit msg or event to client from server 
                socket.emit('message', formatMessage(Notification, `Welcome to ChatApp !! You are Welcome in Room ${user.room}. `));

                // Broadcast when a user connects - broadcast to everybody except the user which is connecting
                socket.broadcast.to(user.room).emit('message', formatMessage(Notification, `${user.username} has joined the chat`));

                //Send users and room info
                io.to(user.room).emit('roomUsers', {
                        room: user.room,
                        users: getRoomUsers(user.room)
                });


        });



        //Catch msg which we emitted 
        //Listen for chatMessage
        socket.on('chatMessage', msg => {

                const user = getCurrentUser(socket.id);
                //emit to everybody
                io.to(user.room).emit('message', formatMessage(user.username, msg));

        });

        // Runs when client disconnects
        socket.on('disconnect', () => {

                const user = userLeave(socket.id);

                if (user) {
                        io.to(user.room).emit('message', formatMessage(Notification, `${user.username} has left the chat`));

                        //Send users and room info
                        io.to(user.room).emit('roomUsers', {
                                room: user.room,
                                users: getRoomUsers(user.room)
                        });
                }

        });


});

//To run a server
server.listen(PORT, () => {

        console.log(`Server running on port ${PORT}`);
});
