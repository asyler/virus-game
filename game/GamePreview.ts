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

            this.add.text(0,0,R.strings['players'],R.fonts['white_1'], this.info_group);
            this.players.forEach(function (player, i) {
                this.add.text(0,0,player.UserName,R.fonts['player_name_1'](BoardGame.colors[i]), this.info_group);
            }, this);

            this.add.text(0,0,R.strings['game#']+this.info.GameID,R.fonts['white_1'], this.info_group);
            this.add.text(0,0,R.strings['player_count']+':'+this.info.UsersCount,R.fonts['white_1'], this.info_group);

            this.info_group.align(1,-1,game.world.width,30,Phaser.CENTER);
        }

        setPlayers(players) {
            this.players = players;
            this.done();
        }

        setInfo(info) {
            this.info = info;
            this.done();
        }
    }

}