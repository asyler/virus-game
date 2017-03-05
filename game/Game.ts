module VirusGame {
    export let game: Phaser.Game;

    export class Game extends Phaser.Game {

        constructor() {

            super(800, 600, Phaser.AUTO, 'content', null);

            game = this;

            this.state.add('Boot', Boot, false);
            this.state.add('Preloader', Preloader, false);
            this.state.add('MainMenu', MainMenu, false);
            this.state.add('Login', Login, false);
            this.state.add('BoardGame', BoardGame, false);

            this.state.start('Boot');


        }

    }

}
