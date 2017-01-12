window.onload = () => {
    let game = new VirusGame.Game();
};
var VirusGame;
(function (VirusGame) {
    var CellState;
    (function (CellState) {
        CellState[CellState["Empty"] = 0] = "Empty";
        CellState[CellState["Alive"] = 1] = "Alive";
        CellState[CellState["Dead"] = 2] = "Dead";
    })(CellState || (CellState = {}));
    ;
    class BoardCell {
        constructor(game, x, y, board_game) {
            this.state = 0;
            let image = game.add.image(0, 0, 'board_cells', 'grey_box', board_game.board);
            this.image = image;
            image.inputEnabled = true;
            image.input.useHandCursor = true;
            image.events.onInputOver.add(function () {
                image.tint = 0xaaaaaa;
            });
            image.events.onInputOut.add(function () {
                image.tint = 0xffffff;
            });
            image.events.onInputUp.add(function () {
                switch (this.state) {
                    case 0:
                        this.image.frameName = board_game.current_player_color + '_boxCross';
                        this.state = 1;
                        board_game.endTurn();
                        break;
                    case 1:
                        this.image.frameName = board_game.current_player_color + '_boxCheckmark';
                        this.state = 2;
                        board_game.endTurn();
                        break;
                    case 2:
                        break;
                }
            }, this);
        }
    }
    VirusGame.BoardCell = BoardCell;
})(VirusGame || (VirusGame = {}));
var VirusGame;
(function (VirusGame) {
    class BoardGame extends Phaser.State {
        constructor() {
            super(...arguments);
            this.number_of_players = 2;
            this.colors = ['blue', 'yellow'];
        }
        create() {
            this.addPlayers();
            this.initGame();
            this.drawBoard();
            this.drawInfo();
        }
        drawInfo() {
            this.info = this.add.existing(new VirusGame.Info(this.game, this.world.centerX, 10));
            this.info.setInfo(this.current_player, this.left_turn_cells);
        }
        drawBoard() {
            this.board = this.add.group();
            for (let i = 0; i < 10; i++) {
                for (let j = 0; j < 10; j++) {
                    this.addCell(i, j);
                }
            }
            this.board.align(10, 10, 38, 36);
            this.board.alignIn(this.world.bounds, Phaser.CENTER);
        }
        addCell(x, y) {
            let cell = new VirusGame.BoardCell(this.game, x, y, this);
        }
        addPlayers() {
            this.players = [];
            for (let i = 0; i < this.number_of_players; i++) {
                this.players.push(new VirusGame.BoardPlayer(this.colors[i]));
            }
        }
        initGame() {
            this.current_player_number = 0;
            this.left_turn_cells = 1;
            this.current_player.is_first_turn = false;
        }
        get current_player() {
            return this.players[this.current_player_number];
        }
        get current_player_color() {
            return this.players[this.current_player_number].color;
        }
        endTurn() {
            this.left_turn_cells--;
            this.checkTurnChange();
            this.info.setInfo(this.current_player, this.left_turn_cells);
        }
        checkTurnChange() {
            if (this.left_turn_cells == 0) {
                this.current_player_number = (this.current_player_number + 1) % this.number_of_players;
                if (this.current_player.is_first_turn == true) {
                    this.left_turn_cells = 1;
                    this.current_player.is_first_turn = false;
                }
                else {
                    this.left_turn_cells = 3;
                }
            }
        }
    }
    VirusGame.BoardGame = BoardGame;
})(VirusGame || (VirusGame = {}));
var VirusGame;
(function (VirusGame) {
    class BoardPlayer {
        constructor(color) {
            this.color = color;
            this.is_first_turn = true;
        }
    }
    VirusGame.BoardPlayer = BoardPlayer;
})(VirusGame || (VirusGame = {}));
var VirusGame;
(function (VirusGame) {
    class Boot extends Phaser.State {
        preload() {
            this.load.image('preloadBar', 'assets/loader.png');
        }
        create() {
            this.input.maxPointers = 1;
            this.stage.disableVisibilityChange = true;
            this.game.state.start('Preloader', true, false);
        }
    }
    VirusGame.Boot = Boot;
})(VirusGame || (VirusGame = {}));
var VirusGame;
(function (VirusGame) {
    class Game extends Phaser.Game {
        constructor() {
            super(800, 600, Phaser.AUTO, 'content', null);
            this.state.add('Boot', VirusGame.Boot, false);
            this.state.add('Preloader', VirusGame.Preloader, false);
            this.state.add('MainMenu', VirusGame.MainMenu, false);
            this.state.add('BoardGame', VirusGame.BoardGame, false);
            this.state.start('Boot');
        }
    }
    VirusGame.Game = Game;
})(VirusGame || (VirusGame = {}));
var VirusGame;
(function (VirusGame) {
    class Info extends Phaser.Text {
        constructor(game, x, y) {
            super(game, x, y, null);
            this.anchor.set(0.5, 0);
        }
        setInfo(player, left_turns) {
            let str = left_turns + " cells more for " + player.color.toString() + " player";
            this.setText(str);
            this.setStyle({
                "fill": player.color,
                "font": "bold 40px Arial"
            });
        }
    }
    VirusGame.Info = Info;
})(VirusGame || (VirusGame = {}));
var VirusGame;
(function (VirusGame) {
    class MainMenu extends Phaser.State {
        create() {
            this.logo = this.add.text(this.world.centerX, 100, 'VIRUS', {
                "fill": "#2ba6b7",
                "font": "bold 60px Arial"
            });
            this.logo.anchor.set(0.5, 0.5);
            this.button = this.add.button(this.world.centerX, 200, 'ui', this.startGame, this, 'blue_button01', 'blue_button03', 'blue_button05');
            this.button.anchor.set(0.5, 0.5);
            this.button_text = this.add.text(0, 0, 'Start game', {
                "fill": "#fefefe",
                "font": "bold 24px Arial",
                "stroke": "#000000",
                "strokeThickness": 2
            });
            this.button_text.alignIn(this.button, Phaser.CENTER);
            this.startGame();
        }
        startGame() {
            this.game.state.start('BoardGame', true, false);
        }
    }
    VirusGame.MainMenu = MainMenu;
})(VirusGame || (VirusGame = {}));
var VirusGame;
(function (VirusGame) {
    class Preloader extends Phaser.State {
        preload() {
            this.preloadBar = this.add.sprite(200, 250, 'preloadBar');
            this.load.setPreloadSprite(this.preloadBar);
            this.load.atlasXML('ui', 'assets/ui.png', 'assets/ui.xml');
            this.load.atlasJSONHash('board_cells', 'assets/board_cells.png', 'assets/board_cells.json');
        }
        create() {
            let tween = this.add.tween(this.preloadBar).to({ alpha: 0 }, 100, Phaser.Easing.Linear.None, true);
            tween.onComplete.add(this.startMainMenu, this);
        }
        startMainMenu() {
            this.game.state.start('MainMenu', true, false);
        }
    }
    VirusGame.Preloader = Preloader;
})(VirusGame || (VirusGame = {}));
//# sourceMappingURL=app.js.map