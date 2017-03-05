module VirusGame {
    export class Client {
        private id: string;
        private socket: SocketIOClient.Socket;
        active_game: string;
        private user_id: number;
        constructor() {
            let _this = this;

            this.socket = io();
            this.socket.on('onConnected', function(data){
                _this.id = data.id;

                _this.findGame();
            });

            this.socket.on('added to game', function (game_id) {
               console.log(game_id);
                _this.active_game = game_id;
            });

            this.socket.on('start game', function (first_player) {
                if (first_player!=this.id) {
                    let state = <BoardGame>((<any>window).game.state.getCurrentState());
                    state.current_player_number = 1;
                }

            });

            this.socket.on('player move', function (userid, gameid, row, col) {
                if (gameid==_this.active_game && userid!=_this.id) {
                    let state = <BoardGame>((<any>window).game.state.getCurrentState());
                    state.getCellByCoords(row,col).cellPlayed();
                }
            });

            this.socket.on('user_login_results', function (user) {
                _this.perform_login(user);
            });

            this.socket.on('user_register_results', function (user) {
                _this.perform_login(user);
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
        host_game() {
            this.socket.emit('host game', this.user_id, 2);
        }

        player_move(row: number, col: number) {
            this.socket.emit('player move', this.active_game, row, col);
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
    }
}
