

class Client {
        private id: string;
        private socket: SocketIOClient.Socket;
        active_game: string;
        constructor() {
            let _this = this;

            this.socket = io();
            this.socket.on('onConnected', function (data) {
                _this.socket.emit('mysql_test');
            });

            this.socket.on('mysql_test_results', function (data) {
                console.log(data);
            });

        }
}

new Client();
