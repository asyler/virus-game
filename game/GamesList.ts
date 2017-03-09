module VirusGame {

    export class GamesList extends DBState {
        private items;
        public sprite = "scrollbar";
        private layout: UIPlugin.SliderLayout;
        private type: string;

        _init(type) {
            this.type = type;

        }

        preload() {
            this.load.atlasJSONHash('scrollbar', 'assets/scrollbar.png', 'assets/scrollbar.json');
            this.wait(1);
            if (this.type=='join')
                client.load_joinable_games();
            else if (this.type=='resume')
                client.load_my_games();
            let back = game.add.button(50,50,'arrow_back',function () {
                (<StateManager>game.state).back();
            });
            back.width = back.height = 40;
        }

        _create() {
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
        }

        setGames(games) {
            this.items = games;
            this.done();
        }

        show_game(item, data, cell) {
            let gameInfo = R.strings['game#']+data.GameID;
            if (data.PlayersCount)
                gameInfo += ' ('+data.PlayersCount+'/'+data.UsersCount+')';
            let button = ui.add.text_button(0, 0, this.open_game, this, gameInfo, R.fonts['white_1'], item);
            button.button.data.id = data.GameID;
        }

        open_game(b) {
            game.state.start('GamePreview', true, false, b.data.id);
        }
    }

}