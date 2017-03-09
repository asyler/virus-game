module VirusGame {
    export let game: Phaser.Game;
    export let ui: UIPlugin.Plugin;

    export class Game extends Phaser.Game {

        constructor() {

            super(800, 600, Phaser.AUTO, 'content', null);

            game = this;
            ui = new UIPlugin.Plugin(game);

            this.state.add('Boot', Boot, false);
            this.state.add('Preloader', Preloader, false);
            this.state.add('Login', Login, false);
            this.state.add('MainMenu', MainMenu, false);
            this.state.add('GamesList', GamesList, false);
            this.state.add('GamePreview', GamePreview, false);
            this.state.add('BoardGame', BoardGame, false);

            this.state.start('Boot');


        }

    }

}
