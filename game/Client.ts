module VirusGame {
    export class Client {
        private id: string;
        private socket: SocketIOClient.Socket;
        active_game: number;
        user_id: number;
        constructor() {
            let _this = this;

            this.socket = io();
            this.socket.on('onConnected', function(data){
                _this.id = data.id;
            });

            this.socket.on('player_move', function (userID, row, col, state) {
                let game_state = <BoardGame>(game.state.getCurrentState());
                if (userID!==client.user_id)
                    game_state.opponentTurn(userID, row, col, state);
            });

            this.socket.on('user_login_results', function (user) {
                _this.perform_login(user);
            });

            this.socket.on('user_register_results', function (user) {
                _this.perform_login(user);
            });

            this.socket.on('load_games_results', function (games) {
                (<GamesList>game.state.getCurrentState()).setGames(games);
            });

            this.socket.on('load_game_info', function (info) {
                (<any>game.state.getCurrentState()).setInfo(info);
            });

            this.socket.on('load_game_players', function (players) {
                (<any>game.state.getCurrentState()).setPlayers(players);
            });

            this.socket.on('joined', function (GameID) {
                game.state.restart(true, false, GameID);
            });

            this.socket.on('left', function (GameID) {
                game.state.restart(true, false, GameID);
            });

            this.socket.on('deleted', function (GameID) {
                (<StateManager>game.state).back();
            });

            this.socket.on('load_game_board', function (data) {
                (<BoardGame>game.state.getCurrentState()).setBoardData(data);
            });
        }

        // handle server response
        perform_login(user) {
            if (user.length==1) {
                this.user_id = user[0].id;
                game.state.start('MainMenu', true, false);
            }
        }

        // send to server
        host_game(max_players: number) {
            this.socket.emit('host game', this.user_id, max_players);
        }

        player_move(gameID, row, col, state, cellsLeft, currentPlayer, playerMoved, usersLost) {
            this.socket.emit('player move', this.user_id, gameID, row, col, state, cellsLeft, currentPlayer, playerMoved, usersLost);

        }

        emit(type: string) {
            this.socket.emit('m', type, this.id);
        }

        findGame() {
            this.emit('findGame');
        }

        login(login:string, password:string) {
            this.socket.emit('user login', login, password);
        }

        register(login:string, password:string) {
            this.socket.emit('user register', login, password);
        }

        load_my_games() {
            this.socket.emit('load my games', this.user_id);
        }

        load_joinable_games() {
            this.socket.emit('load joinable games', this.user_id);
        }

        preview_game(GameID:number) {
            this.socket.emit('load game info', GameID);
            this.socket.emit('load game players', GameID);
        }

        join(GameID:number, player_color:number) {
            this.socket.emit('join game', this.user_id, GameID, player_color);
        }

        leave(GameID:number) {
            this.socket.emit('leave game', this.user_id, GameID);
        }

        delete(GameID:number) {
            this.socket.emit('delete game', this.user_id, GameID);
        }

        start_play(GameID:number) {
            this.socket.emit('load game players', GameID);
            this.socket.emit('load game info', GameID);
            this.socket.emit('load game board', GameID);
        }

        player_defeated(game_id: number, player_id: number) {
            if (this.user_id==player_id)
                // let only defeated player fire this event
                this.socket.emit('player defeated', game_id, player_id);
        }

        game_over(game_id: number, winner_id: number) {
            if (this.user_id==winner_id)
            // let only winner player fire this event
                this.socket.emit('finish game', game_id, winner_id);
        }
    }
}
