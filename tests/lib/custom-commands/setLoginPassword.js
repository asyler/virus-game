exports.command = function(login, password) {
    this.execute(
        function(login, password) {
            var game = window.Phaser.GAMES[0];
            var state = game.state.getCurrentState();
            state.loginInput.value = login;
            state.passInput.value = password;
            state.login();
        },
        [login,password],
        function(result) {}
    );
    return this;
};
