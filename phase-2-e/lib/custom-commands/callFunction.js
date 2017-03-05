exports.command = function(f) {
    this.execute(
        function(f) {
            var game = window.Phaser.GAMES[0];
            var state = game.state.getCurrentState();
            state[f].apply();
        },
        [f],
        function(result) {}
    );
    return this;
};
