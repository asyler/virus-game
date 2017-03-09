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
let gameport = process.env.PORT || 4228;
let _io = require('socket.io');
let express = require('express');
let UUID = require('node-uuid');
let http = require('http');
let path = require('path');
let app = express();
let server = http.createServer(app);
let basepath = path.resolve(__dirname + '/../');
let bcrypt = require('bcrypt');
const saltRounds = 10;
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
sio.sockets.on('connection', function (client) {
    client.userid = UUID();
    clients[client.userid] = client;
    client.emit('onConnected', { id: client.userid });
    client.on('user login', function (userName, password) {
        connection.query('SELECT UserID as id, password FROM users WHERE UserName = ?', [userName], function (error, results, fields) {
            if (error)
                throw error;
            if (results.length > 0)
                bcrypt.compare(password, results[0]['password'], function (err, res) {
                    if (res)
                        client.emit('user_login_results', results);
                });
        });
    });
    client.on('user register', function (userName, password) {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
                connection.query('INSERT INTO users (UserName, Password) VALUES (?, ?);', [userName, hash], function (error, results, fields) {
                    if (error)
                        throw error;
                    connection.query('SELECT LAST_INSERT_ID() as id FROM users;', function (error, results, fields) {
                        if (error)
                            throw error;
                        client.emit('user_register_results', results);
                    });
                });
            });
        });
    });
    client.on('host game', function (ownerID, usersCount) {
        connection.query('INSERT INTO games (creationTime, playerTurn, cellsLeft, usersCount) VALUES (now(), ?, ?, ?)', [0, 1, usersCount], function (error, results, fields) {
            if (error)
                throw error;
            connection.query('INSERT INTO usersgames VALUES (?, ?, ?)', [ownerID, results.insertId, 0], function (error, results, fields) {
                if (error)
                    throw error;
            });
        });
    });
    client.on('join game', function (userID, gameID) {
        connection.query('SELECT MAX(userState) as state FROM usersgames WHERE GameID = ?;', [gameID], function (error, results, fields) {
            if (error)
                throw error;
            connection.query('INSERT INTO usersgames VALUES (?, ?, ?)', [userID, gameID, parseInt(results[0].state) + 1], function (error, results, fields) {
                if (error)
                    throw error;
                client.emit('joined', gameID);
            });
        });
    });
    client.on('load joinable games', function (userID) {
        connection.query('SELECT games.GameID, UsersCount, (SELECT COUNT(*) FROM usersgames WHERE GameID = games.GameID) as PlayersCount FROM games LEFT JOIN usersgames ON games.GameID=usersgames.GameID AND usersgames.UserID = ? WHERE usersgames.GameID IS NULL', [userID], function (error, results, fields) {
            if (error)
                throw error;
            client.emit('load_games_results', results);
        });
    });
    client.on('load my games', function (userID) {
        connection.query('SELECT games.GameID, UsersCount FROM usersgames INNER JOIN games ON games.GameID=usersgames.GameID WHERE UserID = ? AND UsersCount=(SELECT COUNT(*) FROM usersgames WHERE GameID = games.GameID)', [userID], function (error, results, fields) {
            if (error)
                throw error;
            client.emit('load_games_results', results);
        });
    });
    client.on('load game info', function (gameID) {
        connection.query('SELECT * FROM games WHERE GameID = ?;', [gameID], function (error, results, fields) {
            if (error)
                throw error;
            client.emit('load_game_info', results[0]);
        });
    });
    client.on('load game players', function (gameID) {
        connection.query('SELECT users.UserID, UserName FROM usersgames INNER JOIN users ON usersgames.UserID = users.UserID WHERE GameID=? ORDER BY UserState ASC;', [gameID], function (error, results, fields) {
            if (error)
                throw error;
            client.emit('load_game_players', results);
        });
    });
    client.on('load game board', function (gameID) {
        client.join('game#' + gameID);
        connection.query('SELECT * FROM singlegames WHERE GameID=?', [gameID], function (error, results, fields) {
            if (error)
                throw error;
            client.emit('load_game_board', results);
        });
    });
    client.on('finish game', function (gameID, winnerID) {
        connection.query('INSERT INTO statistics (user1, user2, user1winuser2count) VALUES (?, (SELECT UserID FROM usersgames WHERE GameID = ? AND UserID IS NOT ?), ?) ' +
            'ON DUPLICATE KEY user1winuser2count = user1winuser2count + 1;', [winnerID, gameID, winnerID, 1], function (error, results, fields) {
            if (error)
                throw error;
        });
        connection.query('DELETE FROM singleGames WHERE GameID = ?; DELETE FROM usersGames WHERE gameID = ?; DELETE FROM games WHERE gameID = ?', [gameID, gameID, gameID], function (error, results, fields) {
            if (error)
                throw error;
        });
    });
    client.on('player move', function (userID, gameID, row, col, state, cellsLeft, currentPlayer, usersLost) {
        connection.query('INSERT INTO singlegames VALUES (?, ?, ?, ?, ?)', [gameID, row, col, state, userID], function (error, results, fields) {
            if (error)
                throw error;
        });
        connection.query('UPDATE games SET playerTurn=?, cellsLeft=?, usersCount=usersCount-? WHERE GameID=?;', [currentPlayer, cellsLeft, usersLost, gameID], function (error, results, fields) {
            if (error)
                throw error;
        });
        sio.sockets.to('game#' + gameID).emit('player_move', userID, row, col, state);
    });
    client.on('disconnect', function () {
    });
});
//# sourceMappingURL=server_app.js.map