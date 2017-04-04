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
let bcrypt = require('bcrypt');
const saltRounds = 10;

let mysql      = require('mysql');
let config = require('../server/config.json');
let connection = mysql.createConnection({
    host     : config.host,
    user     : config.user,
    password : config.password,
    database : config.database
});
connection.connect();

let clients : {[id: string] : SocketIO.Socket} = {};

server.listen(gameport);

console.log('Listening on port ' + gameport );

app.get( '/', function( req, res ){
    res.sendFile( '/index.html' , { root:basepath });
});

app.get('/test', function (req, res) {
    res.sendFile('/test.html', { root: basepath });
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

sio.sockets.on('connection', function (client) {
    client.userid = UUID();
    //console.log('player ' + client.userid + ' connected');

    clients[client.userid] = client;
    client.emit('onConnected', { id: client.userid } );

    client.on('user login', function(userName, password) {
		connection.query('SELECT id, password FROM users WHERE username = ?', [userName], function (error, results, fields) {
			if (error) throw error;
				if (results.length>0)
					bcrypt.compare(password, results[0]['password'], function(err, res) {
						if (res)
							client.emit('user_login_results', results);
					});
		});
	});

	client.on('user register', function (userName, password) {
		connection.query('SELECT id FROM virus.users WHERE username = ?;', [userName], function (error, results, fields) {
			if (error) throw error;
			if (results.length != 0) {
				// TODO: Add "User already exists" message
			} else {
				bcrypt.genSalt(saltRounds, function (err, salt) {
					bcrypt.hash(password, salt, function (err, hash) {
						connection.query('INSERT INTO users (username, password) VALUES (?, ?);', [userName, hash], function (error, results, fields) {
							if (error) throw error;
							connection.query('SELECT LAST_INSERT_ID() as id FROM users;', function (error, results, fields) {
								if (error) throw error;
								client.emit('user_register_results', results);
							});
						});
					});
				});
			};
		});
	});
	
	client.on('host game', function(owner_id, max_players) {
		connection.query('INSERT INTO games (created, current_player, player_cells_left, max_players, players) VALUES (NOW(), ?, ?, ?, ?)', [0, 1, max_players, 1],
		function (error, results, fields) {
				if (error) throw error;
                connection.query('INSERT INTO users_games (user_id, game_id, player_state, player_color) VALUES (?, ?, ?, ?)', [owner_id, results.insertId, 0, 0],
                    function (error, results, fields) {
                        if (error) throw error;
                    });
			});
	});
	
	client.on('join game', function(userID: number, gameID: number, playerColor: number) {
		connection.query('SELECT MAX(player_state) as state FROM users_games WHERE game_id = ?;', [gameID], function (error, results, fields) {
			if (error) throw error;
			connection.query('INSERT INTO users_games (user_id, game_id, player_state, player_color) VALUES (?, ?, ?, ?)', [userID, gameID, parseInt(results[0].state) + 1, playerColor], function (error, results, fields) {
				if (error) throw error;
				connection.query('UPDATE games SET players = players + 1 WHERE id = ?;', [gameID], function (error, results, fields) {
					if (error) throw error;
					client.emit('joined', gameID);
				});
			});
		});
	});

	client.on('leave game', function (userID: number, gameID: number) {
		connection.query('DELETE FROM users_games WHERE user_id = ? AND game_id = ?', [userID, gameID], function (error, results, fields) {
			if (error) throw error;
			connection.query('UPDATE games SET players = players - 1 WHERE id = ?;', [gameID], function (error, results, fields) {
				if (error) throw error;
				client.emit('left', gameID);
			});
		});
	});

	client.on('delete game', function (userID: number, gameID: number) {
		connection.query('DELETE FROM users_games WHERE user_id = ? AND game_id = ?', [userID, gameID], function (error, results, fields) {
			if (error) throw error;
			connection.query('DELETE FROM games WHERE id = ?;', [gameID], function (error, results, fields) {
				if (error) throw error;
				client.emit('deleted', gameID);
			});
		});
	});

	client.on('load joinable games', function(userID: number) {
		connection.query('SELECT games.id, max_players, players FROM games WHERE players < max_players', function (error, results, fields) {
			if (error) throw error;
			client.emit('load_games_results', results);
		});
	});

	client.on('load my games', function(userID: number) {
		connection.query('SELECT games.id, games.max_players FROM users_games INNER JOIN games ON games.id=users_games.game_id WHERE user_id = ? AND games.max_players=games.players', [userID], function (error, results, fields) {
            if (error) throw error;
            client.emit('load_games_results', results);
        });
    });
	
	client.on('load game info', function(gameID: number) {
        connection.query('SELECT * FROM games WHERE id = ?;', [gameID], function (error, results, fields) {
            if (error) throw error;
            client.emit('load_game_info', results[0]);
        });
    });

	client.on('load game players', function (gameID: number) {
		connection.query('SELECT users_games.user_id, users.username, users_games.player_color, users_games.player_state, users_games.is_alive FROM users_games INNER JOIN users ON users_games.user_id = users.id WHERE game_id=? ORDER BY player_state ASC;', [gameID], function (error, results, fields) {
			if (error) throw error;
			client.emit('load_game_players', results);
		});
	});

	client.on('load game board', function (gameID: number) {
		client.join('game#'+gameID);
		connection.query('SELECT * FROM board_cells WHERE id=?', [gameID], function (error, results, fields) {
			if (error) throw error;
			client.emit('load_game_board', results);
		});
	});

	client.on('player defeated', function (game_id: number, player_id: number) {
		connection.query('UPDATE users SET losses = losses + 1 WHERE id = ?', [player_id], function (error, results, fields) {
			if (error) throw error;
		});
		connection.query('UPDATE users_games SET is_alive = 0 WHERE game_id = ? and user_id = ?', [game_id,player_id], function (error, results, fields) {
			if (error) throw error;
		});
	})
	
	client.on('finish game', function(gameID: number, winnerID: number) {
        connection.query('INSERT INTO pvp_statistics (user1, user2, user1_wins) SELECT ?, user_id, 1 FROM users_games WHERE game_id = ? AND user_id != ? ' +
						 'ON DUPLICATE KEY UPDATE user1_wins = user1_wins + 1', [winnerID, gameID, winnerID], function (error, results, fields) {
			if (error) throw error;
			connection.query('DELETE FROM games WHERE id = ?', [gameID],
				function (error, results, fields) {
					if (error) throw error;
				});
		});
		connection.query('UPDATE users SET wins = wins + 1 WHERE id = ?', [winnerID], function (error, results, fields) {
			if (error) throw error;
		});
    });

    client.on('player move', function(userID, gameID, row, col, state, cellsLeft, currentPlayer, playerMoved, usersLost) {
        connection.query('INSERT INTO board_cells (id,x,y,state,player) VALUES (?, ?, ?, ?, ?)', [gameID, row, col, state, playerMoved], function (error, results, fields) {
            if (error) throw error;
        });
		connection.query('UPDATE games SET current_player=?, player_cells_left=?, players=players-? WHERE id=?;', [currentPlayer, cellsLeft, usersLost, gameID],
		function (error, results, fields) {
            if (error) throw error;
        });
		sio.sockets.to('game#'+gameID).emit('player_move', userID, row, col, state);
    });

    client.on('disconnect', function () {
        //console.log('client disconnected ' + client.userid + ' ' + client.game_id);
    });
});