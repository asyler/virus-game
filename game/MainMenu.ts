module VirusGame {

    export class MainMenu extends Phaser.State {

        logo: Phaser.Text;
        button: Phaser.Button;
        button_text: Phaser.Text;
        ui: UIPlugin.Plugin;

        create() {
            this.ui = new UIPlugin.Plugin(this.game);

            this.logo = this.add.text(this.world.centerX, 100, R.strings['game_name'].toUpperCase(), R.fonts['blue_1']);
            this.logo.anchor.set(0.5,0.5);

            this.ui.add.button(this.world.centerX, 200, this.hostGame, this, R.strings['host_game'], R.fonts['white_1']);
            this.ui.add.button(this.world.centerX, 250, this.joinGame, this, R.strings['join_game'], R.fonts['white_1']);

            //this.startGame(); // debug
        }

        hostGame() {
            client.host_game();
        }
        joinGame() {}

        startGame() {
            this.game.state.start('BoardGame', true, false);
        }

    }

}