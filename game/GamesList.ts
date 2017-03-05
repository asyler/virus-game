module VirusGame {

    export class GamesList extends Phaser.State {
        ui: UIPlugin.Plugin;
        private items;
        public sprite = "scrollbar";
        public ddd: any;
        private ddd2;

        init(games) {
            this.items = games;
        }

        preload() {
            this.ui = new UIPlugin.Plugin(this.game);
        }

        create() {
            let gr = game.add.group();

            let layout = new UIPlugin.SliderLayout({
                parent: this,
                container: gr,
                bg: new Phaser.Rectangle(0,0,580,260),
                show_item: this.show_game,
                position: [100,170],
                slider_position: [590,0],
                cols: 1,
                item_size: [190,50],
                items_offset: [0,20]
            });
            layout.update_items(this.items);
            //layout.update_items([{},{},{},{},{},{},{},{}]);
            this.ddd2 = layout.items_group.mask;
        }

        show_game(item, data, cell) {
            let button = this.ui.add.text_button(0, 0, this.open_game, this, R.strings['game#']+data.GameID, R.fonts['white_1'], item);
        }

        open_game() {}


        update() {
            if (this.ddd2) {
                // game.debug.spriteBounds(<Phaser.Sprite> this.ddd2, 'rgba(0,255,0,0.3)');
            }
        }
    }

}