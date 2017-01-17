class GameS {
    constructor(userid) {
        this.players = [];
        this.max_players = 2;
        this.id = UUID();
        this.addPlayer(userid);
    }
    addPlayer(userid) {
        this.players.push(userid);
        clients[userid].emit('added to game', this.id);
        clients[userid].join('game_' + this.id);
    }
    isFilled() {
        return this.players.length == this.max_players;
    }
    start() {
        sio.to('game_' + this.id).emit('start game', this.players[0]);
    }
}
class GameServer {
    constructor() {
        this.waiting_games = [];
        this.playing_games = {};
    }
    onMessage(client, message) {
        this[message].apply(this, [client.userid]);
    }
    findGame(userid) {
        if (this.waiting_games.length > 0) {
            let game = this.waiting_games[0];
            game.addPlayer(userid);
            if (game.isFilled()) {
                this.playing_games[game.id] = this.waiting_games.shift();
                game;
                game.start();
            }
        }
        else {
            let game = new GameS(userid);
            this.waiting_games.push(game);
        }
    }
    onPlayerMove(userid, gameid, row, col) {
        sio.to('game_' + gameid).emit('player move', userid, gameid, row, col);
    }
}
let gameport = process.env.PORT || 4228;
let _io = require('socket.io');
let express = require('express');
let UUID = require('node-uuid');
let http = require('http');
let path = require('path');
let app = express();
let server = http.createServer(app);
let basepath = path.resolve(__dirname + '/../');
let clients = {};
server.listen(gameport);
console.log('Listening on port ' + gameport);
app.get('/', function (req, res) {
    res.sendFile('/index.html', { root: basepath });
});
app.get('/*', function (req, res, next) {
    let file = req.params[0];
    res.sendFile(basepath + '/' + file);
});
var sio = _io.listen(server);
let game_server = new GameServer();
sio.sockets.on('connection', function (client) {
    client.userid = UUID();
    clients[client.userid] = client;
    client.emit('onConnected', { id: client.userid });
    client.on('m', function (m) {
        game_server.onMessage(client, m);
    });
    client.on('player move', function (game, row, col) {
        game_server.onPlayerMove(client.userid, game, row, col);
    });
    client.on('disconnect', function () {
    });
});
//# sourceMappingURL=server_app.js.map