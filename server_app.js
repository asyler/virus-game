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
let mysql = require('mysql');
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'w9DllBJj',
    database: 'virus'
});
connection.connect();
let clients = {};
server.listen(gameport);
console.log('Listening on port ' + gameport);
app.get('/', function (req, res) {
    res.sendFile('/index.html', { root: basepath });
});
app.get('/test', function (req, res) {
    res.sendFile('/test.html', { root: basepath });
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
    client.on('mysql_test', function (m) {
        connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
            if (error)
                throw error;
            client.emit('mysql_test_results', results);
        });
    });
    client.on('create game', function (gameID, creationTime, usersCount) {
        connection.query('INSERT INTO games (GameID, CreationTime, PlayerTurn, CellsLeft, UsersCount) VALUES (?, ?, 0, 1, ?);', [gameID], [creationTime], [usersCount], function (error, results, fields) {
            if (error)
                throw error;
            client.emit('create_game_results', true);
        });
    });
    client.on('host game', function (ownerID, usersCount, creationTime) {
        connection.query('INSERT INTO games (creationTime, playerTurn, cellsLeft, usersCount) VALUES (?, ?, ?)', [creationTime, 0, 100, usersCount], function (error, results, fields) {
            if (error)
                throw error;
        });
        connection.query('SELECT GameID FROM games WHERE (creationTime = ? AND playerTurn = ? AND cellsLeft = ? AND usersCount = ?', [creationTime, 0, 100, usersCount], function (error, results, fields) {
            if (error)
                throw error;
            connection.query('INSERT INTO usersGames VALUES (?, ?, ?)', [ownerID, results, 0], function (error, results, fields) {
                if (error)
                    throw error;
            });
        });
    });
    client.on('join game', function (gameID) {
        connection.query('SELECT MAX(userState) FROM usersGames WHERE GameID = ?;', [gameID], function (error, results, fields) {
            if (error)
                throw error;
            connection.query('INSERT INTO usersGames VALUES (?, ?, ?)', [client.userID, gameID, results + 1], function (error, results, fields) {
                if (error)
                    throw error;
            });
        });
        client.on('load games', function () {
            connection.query('SELECT GameID FROM games;', function (error, results, fields) {
                if (error)
                    throw error;
                client.emit('load_games_results', results);
            });
        });
        client.on('load game by id', function (gameID) {
            connection.query('SELECT * FROM games WHERE GameID = ?;', [gameID], function (error, results, fields) {
                if (error)
                    throw error;
                client.emit('load_game_by_id_results', results);
            });
        });
        client.on('finish game', function (gameID, winnerID) {
            connection.query('INSERT INTO statistics (user1, user2, user1winuser2count) VALUES (?, (SELECT userID FROM usersGames WHERE gameID = ? AND userID IS NOT ?), ?) ', 'ON DUPLICATE KEY user1winuser2count = user1winuser2count + 1;', [winnerID, gameID, winnerID, 1], function (error, results, fields) {
                if (error)
                    throw error;
            });
        });
        connection.query('DELETE FROM singleGames WHERE GameID = ?; DELETE FROM usersGames WHERE gameID = ?; DELETE FROM games WHERE gameID = ?', [gameID, gameID, gameID], function (error, results, fields) {
            if (error)
                throw error;
        });
    });
});
client.on('player move', function (gameID, row, col, state, userID, cellsKilled, usersLost) {
    game_server.onPlayerMove(client.userid, game, row, col);
    connection.query('INSERT INTO singlegames VALUES (?, ?, ?, ?, ?)', [gameID, row, col, state, userID], function (error, results, fields) {
        if (error)
            throw error;
    });
    connection.query('UPDATE games SET playerTurn=playerTurn+1, cellsLeft=cellsLeft-?, usersCount=usersCount-? WHERE GameID=?;', [cellsKilled, usersLost, gameID], function (error, results, fields) {
        if (error)
            throw error;
    });
});
client.on('disconnect', function () {
});
;
//# sourceMappingURL=server_app.js.map