module VirusGame {

    export class GamePreview extends DBState {
        private id: number;
        private info_group: Phaser.Group;
        private players;
        private info;
        _init(GameID) {
            this.id = GameID;
        }

        preload() {
            this.wait(2);
            client.preview_game(this.id);
            let back = game.add.button(50,50,'arrow_back',function () {
                (<StateManager>game.state).back();
            });
            back.width = back.height = 40;
        }

        _create() {
            this.info_group = game.add.group();
            this.info_group.y = 100;

            this.add.text(0,0,R.strings['game#']+this.info.GameID,R.fonts['white_1'], this.info_group);
            this.add.text(0,0,R.strings['player_count']+':'+this.info.UsersCount,R.fonts['white_1'], this.info_group);

            this.add.text(0,0,R.strings['players'],R.fonts['white_1'], this.info_group);
            this.players.forEach(function (player, i) {
                this.add.text(0,0,player.UserName,R.fonts['player_name_1'](BoardGame.colors[i]), this.info_group);
            }, this);

            this.info_group.align(1,-1,game.world.width,30,Phaser.CENTER);

            let b_text;
            let b_callback;
            if (this.players.length<this.info.UsersCount) {
                // need more players
                b_text = R.strings['join'];
                b_callback = this.join;
            } else {
                // ready to play
                b_text = R.strings['play'];
                b_callback = this.play;
            }
            let button = ui.add.text_button(0, 0, b_callback, this, b_text, R.fonts['white_1'])
                .alignIn(game.world.bounds, Phaser.BOTTOM_CENTER, 0, -100);
        }

        setPlayers(players) {
            this.players = players;
            this.done();
        }

        setInfo(info) {
            this.info = info;
            this.done();
        }

        join() {
            client.join(this.info.GameID);
        }

        play() {
            game.state.start('BoardGame', true, false, this.info.GameID);
        }

    }

}