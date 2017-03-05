module VirusGame {

    export let client: Client;

    export class Preloader extends Phaser.State {

        preloadBar: Phaser.Sprite;

        preload() {

            //  Set-up our preloader sprite
            this.preloadBar = this.add.sprite(200, 250, 'preloadBar');
            this.load.setPreloadSprite(this.preloadBar);

            //  Load our actual games assets
            this.load.atlasXML('ui', 'assets/ui.png', 'assets/ui.xml');
            this.load.atlasJSONHash('scrollbar', 'assets/scrollbar.png', 'assets/scrollbar.json');
            this.load.atlasJSONHash('board_cells', 'assets/board_cells.png', 'assets/board_cells.json');

            client = new Client();
        }

        create() {
            let tween = this.add.tween(this.preloadBar).to({ alpha: 0 }, 100, Phaser.Easing.Linear.None, true);
            tween.onComplete.add(this.startMainMenu, this);

        }

        startMainMenu() {

            this.game.state.start('Login', true, false);

        }

    }

}