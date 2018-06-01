var mysql = require('mysql')
// Let’s make node/socketio listen on port 3000
var io = require('socket.io').listen(3000)
// Define our db creds
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Luc4s2101.',
    database: 'node'
})
 
// Log any errors connected to the db
db.connect(function(err){
    if (err) console.log(err)
})
 
// Define/initialize our global vars
var messages = []
var isInitMessages = false
var socketCount = 0
 
io.sockets.on('connection', function(socket){
    // Socket has connected, increase socket count
    socketCount++
    // Let all sockets know how many are connected
    io.sockets.emit('users connected', socketCount)
 
    socket.on('disconnect', function() {
        // Decrease the socket count on a disconnect, emit
        socketCount--
        io.sockets.emit('users connected', socketCount)
    })
 
    socket.on('new message', function(data){
        // New message added, push to all sockets and insert into db
        messages.push(data)
        io.sockets.emit('new message', data)
        // Use node's db injection format to filter incoming data
        db.query('INSERT INTO messages (message) VALUES (?)', data.message)
    })
 
    // Check to see if initial query/messages are set
    if (! isInitMessages) {
        // Initial app start, run db query
        db.query('SELECT * FROM messages')
            .on('result', function(data){
                // Push results onto the messages array
                messages.push(data)
            })
            .on('end', function(){
                // Only emit messages after query has been completed
                socket.emit('initial messages', messages)
            })
 
        isInitMessages = true
    } else {
        // Initial messages already exist, send out
        socket.emit('initial messages', messages)
    }
})