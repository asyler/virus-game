module VirusGame {

    import TextButton = UIPlugin.TextButton;
    export class CreateGame extends Phaser.State {
        private colorButtonGroup: Phaser.Group;
        private activeColor: number;
        private players_num_gr: Phaser.Group;
        private game_params = {};

        preload() {
            let back = game.add.button(50,50,'arrow_back',function () {
                (<StateManager>game.state).back();
            });
            back.width = back.height = 40;

            this.load.atlasJSONHash('board_cells', 'assets/board_cells.png', 'assets/board_cells.json');
        }

        create() {
            let gr = game.add.group();
            gr.y = 100;
            
            this.add.text(0,0,R.strings['select_players#'],R.fonts['white_1'], gr);
            this.players_num_gr = game.add.group(gr);
            for (let i=2; i<=6; i++) {
                ui.add.text_button(0, 0, function (b) {
                    this.changePlayersNumber(i,b);
                }, this, String(i), R.fonts['white_1'], this.players_num_gr, [
                    'blue_button06', 'blue_button06', 'blue_button06', 'blue_button06'
                ]);
            }
            this.players_num_gr.align(-1,1,52,40,Phaser.CENTER);
            this.changePlayersNumber(2,(<TextButton>this.players_num_gr.getAt(0)).button);

            gr.align(1,-1,game.world.width,50,Phaser.CENTER);

            ui.add.text_button(0, 0, this.host, this, R.strings['create_game'], R.fonts['white_1'])
                .alignIn(game.camera.bounds, Phaser.TOP_CENTER,0,-450);

            // select color
            // this.drawColorButtons();
            // this.setActiveColor(0);
        }

        host() {
            client.host_game(this.game_params['max_players']);
        }

        changePlayersNumber(n:number,b: Phaser.Button) {
            this.players_num_gr.forEach(function (text_button) {
                (<TextButton>text_button).button_text.setStyle(R.fonts['white_1'])
            }, this);
            (<TextButton>b.parent).button_text.setStyle(R.fonts['gray_1']);
            this.game_params['max_players'] = n;
        }

        drawColorButtons() {
            this.colorButtonGroup = this.add.group();
            BoardGame.colors.forEach(function(color, i) {
                this.add.button(0,0,'board_cells', function() {
                    this.setActiveColor(i);
                }.bind(this),this,'grey_box',color+'_boxCheckmark','','',this.colorButtonGroup);
            }, this);
            this.colorButtonGroup.alignIn(game.world.bounds, Phaser.BOTTOM_CENTER, 0, -200);;
            this.colorButtonGroup.align(-1,1,40,40);
        }

        setActiveColor(i:number) {
            if (this.activeColor !=null)
                (<Phaser.Button>this.colorButtonGroup.getAt(this.activeColor)).tint = 0xffffff;
            this.activeColor = i;
            (<Phaser.Button>this.colorButtonGroup.getAt(i)).tint = 0xaaaaaa;
        }
    }

}