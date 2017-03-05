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

            this.ui.add.text_button(this.world.centerX, 200, this.createGame, this, R.strings['create_game'], R.fonts['white_1']);
            this.ui.add.text_button(this.world.centerX, 250, this.joinGame, this, R.strings['join_game'], R.fonts['white_1']);
            this.ui.add.text_button(this.world.centerX, 300, this.resumeGame, this, R.strings['resume_game'], R.fonts['white_1']);

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