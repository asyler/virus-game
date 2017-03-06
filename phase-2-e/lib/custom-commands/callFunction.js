exports.command = function(f,param1) {
    this.execute(
        function(f,param1) {
            var game = window.Phaser.GAMES[0];
            var state = game.state.getCurrentState();
            state[f].apply(state, [param1]);
        },
        [f,param1],
        function(result) {}
    );
    return this;
};
