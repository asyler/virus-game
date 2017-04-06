module VirusGame {

    export class GamePreview extends DBState {
        private id: number;
        private info_group: Phaser.Group;
        private colorButtonGroup: Phaser.Group;
        private activeColor: number;

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

            this.load.atlasJSONHash('board_cells', 'assets/board_cells.png', 'assets/board_cells.json');
        }

        _create() {
            this.info_group = game.add.group();
            this.info_group.y = 100;

            this.add.text(0,0,R.strings['game#']+this.id,R.fonts['white_1'], this.info_group);
            this.add.text(0,0,R.strings['player_count']+':'+this.info['max_players'],R.fonts['white_1'], this.info_group);

            this.add.text(0,0,R.strings['players'],R.fonts['white_1'], this.info_group);
            this.players.forEach(function (player, i) {
                this.add.text(0,0,player['username'],R.fonts['player_name_1'](BoardGame.colors[player['player_color']]), this.info_group);
            }, this);

            this.info_group.align(1,-1,game.world.width,30,Phaser.CENTER);

            let b_text;
            let b_callback;
            if (this.info['players']<this.info['max_players']) {
                // need more players
                if (!this.clientAlreadyJoined()) {
                    b_text = R.strings['join'];
                    b_callback = this.join;
                    this.drawColorButtons();
                    this.setActiveColor(0);
                } else if (this.info['players'] != 1) {
                    b_text = R.strings['leave'];
                    b_callback = this.leave;
                } else {
                    b_text = R.strings['delete'];
                    b_callback = this.delete;
                }
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

        clientAlreadyJoined() : boolean {
            return this.players.some( (element, index, array) => element.user_id == client.user_id);
        }

        join() {
            client.join(this.id, this.activeColor);
        }

        leave() {
            client.leave(this.id);
        }

        delete() {
            client.delete(this.id);
        }

        play() {
            game.state.start('BoardGame', true, false, this.id);
        }

        drawColorButtons() {
            this.colorButtonGroup = this.add.group();
            BoardGame.colors.forEach(function(color, i) {
                this.add.button(0,0,'board_cells', function() {
                    this.setActiveColor(i);
                }.bind(this),this,'grey_box',color+'_boxCheckmark','','',this.colorButtonGroup);
            }, this);
            this.colorButtonGroup.align(-1,1,40,40);
            this.colorButtonGroup.alignIn(game.world.bounds, Phaser.BOTTOM_CENTER, 0, -200);
        }

        setActiveColor(i:number) {
            if (this.activeColor !=null)
                (<Phaser.Button>this.colorButtonGroup.getAt(this.activeColor)).tint = 0xffffff;
            this.activeColor = i;
            (<Phaser.Button>this.colorButtonGroup.getAt(i)).tint = 0xaaaaaa;
        }
    }

}