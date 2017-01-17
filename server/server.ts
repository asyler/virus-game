///<reference path='../tsDefinitions/node.d.ts'/>
///<reference path="../tsDefinitions/socket.io.d.ts"/>

let gameport = process.env.PORT || 4228;
let _io = require('socket.io');
let express = require('express');
let UUID = require('node-uuid');
let http = require('http');
let path = require('path');
let app = express();
let server = http.createServer(app);
let basepath = path.resolve(__dirname+'/../');

let clients : {[id: string] : SocketIO.Socket} = {};

server.listen(gameport);

console.log('Listening on port ' + gameport );

app.get( '/', function( req, res ){
    res.sendFile( '/index.html' , { root:basepath });
});

app.get( '/*' , function( req, res, next ) {
    let file = req.params[0];
    res.sendFile( basepath + '/' + file );
});

var sio = _io.listen(server);
// sio.configure(function (){
//     sio.set('log level', 0);
//     sio.set('authorization', function (handshakeData, callback) {
//         callback(null, true); // error first callback style
//     });
// });

let game_server = new GameServer();

sio.sockets.on('connection', function (client) {
    client.userid = UUID();
    //console.log('player ' + client.userid + ' connected');

    clients[client.userid] = client;
    client.emit('onConnected', { id: client.userid } );

    client.on('m', function(m) {
        game_server.onMessage(client, m);
    });

    client.on('player move', function(game, row, col) {
        game_server.onPlayerMove(client.userid, game, row, col);
    });

    client.on('disconnect', function () {
        //console.log('client disconnected ' + client.userid + ' ' + client.game_id);
    });
});