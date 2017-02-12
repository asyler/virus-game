var Client = (function () {
    function Client() {
        var _this = this;
        this.socket = io();
        this.socket.on('onConnected', function (data) {
            _this.socket.emit('mysql_test');
        });
        this.socket.on('mysql_test_results', function (data) {
            console.log(data);
        });
    }
    return Client;
}());
new Client();
