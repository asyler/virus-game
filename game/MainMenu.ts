module VirusGame {

    export class MainMenu extends Phaser.State {

        logo: Phaser.Text;
        button: Phaser.Button;
        button_text: Phaser.Text;

        create() {

            this.logo = this.add.text(this.world.centerX, 100, R.strings['game_name'].toUpperCase(), {
                "fill":"#2ba6b7",
                "font":"bold 60px Arial"
            });
            this.logo.anchor.set(0.5,0.5);

            this.button = this.add.button(this.world.centerX, 200, 'ui', this.startGame, this, 'blue_button01','blue_button03','blue_button05');
            this.button.anchor.set(0.5,0.5);

            this.button_text = this.add.text(0,0,R.strings['start_game'], {
                "fill": "#fefefe",
                "font": "bold 24px Arial",
                "stroke": "#000000",
                "strokeThickness": 2
            });
            this.button_text.alignIn(this.button,Phaser.CENTER);

            this.startGame(); // debug
        }

        startGame() {
            this.game.state.start('BoardGame', true, false);
        }

    }

}