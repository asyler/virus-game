module VirusGame {

    export class MainMenu extends Phaser.State {

        logo: Phaser.Text;
        button: Phaser.Button;
        button_text: Phaser.Text;
        ui: UIPlugin.Plugin;

        preload() {
            this.ui = new UIPlugin.Plugin(this.game);
        }

        create() {
            this.logo = this.add.text(this.world.centerX, 100, R.strings['game_name'].toUpperCase(), R.fonts['blue_1']);
            this.logo.anchor.set(0.5,0.5);

            this.ui.add.text_button(0, 0, this.createGame, this, R.strings['create_game'], R.fonts['white_1'])
                .alignIn(game.camera.bounds, Phaser.TOP_CENTER,0,-200);
            this.ui.add.text_button(0, 0, this.joinGame, this, R.strings['join_game'], R.fonts['white_1'])
                .alignIn(game.camera.bounds, Phaser.TOP_CENTER,0,-250);
            this.ui.add.text_button(0, 0, this.resumeGame, this, R.strings['resume_game'], R.fonts['white_1'])
                .alignIn(game.camera.bounds, Phaser.TOP_CENTER,0,-300);

            //this.startGame(); // debug
        }

        createGame() {
            client.host_game();
        }
        joinGame() {}

        resumeGame() {
            client.load_my_games();
        }

        startGame() {
            this.game.state.start('BoardGame', true, false);
        }

    }

}