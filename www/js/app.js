var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
window.onload = function () {
    var game = new VirusGame.Game();
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
    var BoardCell = (function () {
        function BoardCell(game, x, y, board) {
            this.state = 0;
            this.image = game.add.image(x * 38, y * 36, 'board_cells', 'grey_box', board);
        }
        return BoardCell;
    }());
    VirusGame.BoardCell = BoardCell;
})(VirusGame || (VirusGame = {}));
var VirusGame;
(function (VirusGame) {
    var BoardGame = (function (_super) {
        __extends(BoardGame, _super);
        function BoardGame() {
            _super.apply(this, arguments);
            this.number_of_players = 2;
        }
        BoardGame.prototype.create = function () {
            this.drawBoard();
        };
        BoardGame.prototype.drawBoard = function () {
            this.board = this.add.group();
            this.board.x = this.world.centerX;
            this.board.y = this.world.centerY;
            for (var i = 0; i < 10; i++) {
                for (var j = 0; j < 10; j++) {
                    this.addCell(i, j);
                }
            }
        };
        BoardGame.prototype.addCell = function (x, y) {
            var cell = new VirusGame.BoardCell(this.game, x, y, this.board);
        };
        return BoardGame;
    }(Phaser.State));
    VirusGame.BoardGame = BoardGame;
})(VirusGame || (VirusGame = {}));
var VirusGame;
(function (VirusGame) {
    var BoardPlayer = (function () {
        function BoardPlayer() {
        }
        return BoardPlayer;
    }());
    VirusGame.BoardPlayer = BoardPlayer;
})(VirusGame || (VirusGame = {}));
var VirusGame;
(function (VirusGame) {
    var Boot = (function (_super) {
        __extends(Boot, _super);
        function Boot() {
            _super.apply(this, arguments);
        }
        Boot.prototype.preload = function () {
            this.load.image('preloadBar', 'assets/loader.png');
        };
        Boot.prototype.create = function () {
            this.input.maxPointers = 1;
            this.stage.disableVisibilityChange = true;
            this.game.state.start('Preloader', true, false);
        };
        return Boot;
    }(Phaser.State));
    VirusGame.Boot = Boot;
})(VirusGame || (VirusGame = {}));
var VirusGame;
(function (VirusGame) {
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            _super.call(this, 800, 600, Phaser.AUTO, 'content', null);
            this.state.add('Boot', VirusGame.Boot, false);
            this.state.add('Preloader', VirusGame.Preloader, false);
            this.state.add('MainMenu', VirusGame.MainMenu, false);
            this.state.add('BoardGame', VirusGame.BoardGame, false);
            this.state.start('Boot');
        }
        return Game;
    }(Phaser.Game));
    VirusGame.Game = Game;
})(VirusGame || (VirusGame = {}));
var VirusGame;
(function (VirusGame) {
    var MainMenu = (function (_super) {
        __extends(MainMenu, _super);
        function MainMenu() {
            _super.apply(this, arguments);
        }
        MainMenu.prototype.create = function () {
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
        };
        MainMenu.prototype.startGame = function () {
            this.game.state.start('BoardGame', true, false);
        };
        return MainMenu;
    }(Phaser.State));
    VirusGame.MainMenu = MainMenu;
})(VirusGame || (VirusGame = {}));
var VirusGame;
(function (VirusGame) {
    var Preloader = (function (_super) {
        __extends(Preloader, _super);
        function Preloader() {
            _super.apply(this, arguments);
        }
        Preloader.prototype.preload = function () {
            this.preloadBar = this.add.sprite(200, 250, 'preloadBar');
            this.load.setPreloadSprite(this.preloadBar);
            this.load.atlasXML('ui', 'assets/ui.png', 'assets/ui.xml');
            this.load.atlasJSONHash('board_cells', 'assets/board_cells.png', 'assets/board_cells.json');
        };
        Preloader.prototype.create = function () {
            var tween = this.add.tween(this.preloadBar).to({ alpha: 0 }, 100, Phaser.Easing.Linear.None, true);
            tween.onComplete.add(this.startMainMenu, this);
        };
        Preloader.prototype.startMainMenu = function () {
            this.game.state.start('MainMenu', true, false);
        };
        return Preloader;
    }(Phaser.State));
    VirusGame.Preloader = Preloader;
})(VirusGame || (VirusGame = {}));
//# sourceMappingURL=app.js.map