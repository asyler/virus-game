module VirusGame {
    export class Client {
        private id: string;
        private socket: SocketIOClient.Socket;
        active_game: string;
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
        }

        host_game() {
            this.socket.emit('host game', this.id, 2);
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
    }
}
