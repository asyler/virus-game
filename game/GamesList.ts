module VirusGame {

    export class GamesList extends Phaser.State {
        ui: UIPlugin.Plugin;
        private items;
        public sprite = "scrollbar";

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
                position: [149,168],
                slider_position: [590,0],
                cols: 1,
                item_size: [194,84],
                items_offset: [0,5]
            });
            layout.update_items(this.items);
        }

        show_game(item, data, cell) {
            this.ui.add.text_button(0, 0, this.open_game, this, R.strings['game#']+data.GameID, R.fonts['white_1'])
                .alignIn(cell,Phaser.CENTER);
        }

        open_game() {}

    }

}