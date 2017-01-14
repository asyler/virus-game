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
    })(CellState = VirusGame.CellState || (VirusGame.CellState = {}));
    ;
    class BoardCell extends Phaser.Image {
        constructor(row, col, board_game) {
            super(board_game.game, 0, 0, 'board_cells', 'grey_box');
            this.row = row;
            this.col = col;
            this.state = 0;
            this.isPossibleToMoveTo = false;
            this.inputEnabled = true;
            this.input.useHandCursor = true;
            this.events.onInputOver.add(this.drawUnderPointer, this);
            this.events.onInputOut.add(this.drawNormal, this);
            this.events.onInputUp.add(function () {
                if (board_game.isTurnLegal(row, col)) {
                    switch (this.state) {
                        case 0:
                            this.frameName = board_game.current_player_color + '_boxCross';
                            this.state = 1;
                            this.player = board_game.current_player;
                            board_game.endTurn();
                            break;
                        case 1:
                            this.frameName = board_game.current_player_color + '_boxCheckmark';
                            this.state = 2;
                            this.player = board_game.current_player;
                            board_game.endTurn();
                            break;
                        case 2:
                            break;
                    }
                }
            }, this);
        }
        drawNormal() {
            if (this.isPossibleToMoveTo)
                this.tint = 0xabcdef;
            else
                this.tint = 0xffffff;
        }
        drawUnderPointer() {
            this.tint = 0xaaaaaa;
        }
        makePossibleToMoveTo() {
            this.isPossibleToMoveTo = true;
            this.drawNormal();
        }
        disablePossibleToMoveTo() {
            this.isPossibleToMoveTo = false;
            this.drawNormal();
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
            this.activeCells = [];
            this.possibleMoves = [];
            this.colors = ['blue', 'yellow'];
        }
        create() {
            this.addPlayers();
            this.initGame();
            this.drawBoard();
            this.drawInfo();
        }
        drawInfo() {
            this.infoPanel = this.add.existing(new VirusGame.InfoPanel(this.game, this.world.centerX, 10));
            this.infoPanel.setInfo(this.current_player, this.left_turn_cells);
        }
        drawBoard() {
            this.board = this.add.group();
            for (let row = 0; row < 10; row++) {
                for (let col = 0; col < 10; col++) {
                    this.addCell(row, col);
                }
            }
            this.board.align(10, 10, 38, 36);
            this.board.alignIn(this.world.bounds, Phaser.CENTER);
        }
        addCell(row, col) {
            let cell = new VirusGame.BoardCell(row, col, this);
            if (this.isTileOnEdge(row, col))
                cell.makePossibleToMoveTo();
            this.board.add(cell);
        }
        cellIndex(row, col) {
            let index = 10 * row + col;
            return index;
        }
        getCellByCoords(row, col) {
            return this.getCellByIndex(this.cellIndex(row, col));
        }
        getCellByIndex(index) {
            return this.board.getAt(index);
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
            this.infoPanel.setInfo(this.current_player, this.left_turn_cells);
            this.updateActiveRegion();
            this.updatePossibleMoves();
        }
        checkTurnChange() {
            if (this.left_turn_cells == 0) {
                if (this.current_player.is_first_turn)
                    this.current_player.is_first_turn = false;
                this.activeCells = [];
                this.current_player_number = (this.current_player_number + 1) % this.number_of_players;
                if (this.current_player.is_first_turn)
                    this.left_turn_cells = 1;
                else
                    this.left_turn_cells = 3;
            }
        }
        isTurnLegal(row, col) {
            let cell = this.getCellByCoords(row, col);
            if (this.current_player.is_first_turn)
                if (cell.state == 0)
                    return this.isTileOnEdge(row, col);
                else
                    return false;
            if (this.isCellOccupiable(row, col))
                if (this.isAnyNeighbourActive(row, col))
                    return true;
                else
                    return false;
        }
        isCellOccupiable(row, col) {
            let cell = this.getCellByCoords(row, col);
            return cell.state == 0 || cell.state == 1 && cell.player != this.current_player;
        }
        isTileOnEdge(row, col) {
            return this.isTileOnRightEdge(row, col) || this.isTileOnLeftEdge(row, col) ||
                this.isTileOnTopEdge(row, col) || this.isTileOnBottomEdge(row, col);
        }
        isTileOnRightEdge(row, col) {
            return col == 9;
        }
        isTileOnLeftEdge(row, col) {
            return col == 0;
        }
        isTileOnTopEdge(row, col) {
            return row == 0;
        }
        isTileOnBottomEdge(row, col) {
            return row == 9;
        }
        isAnyNeighbourActive(row, col) {
            let index1 = this.cellIndex(row - 1, col);
            let index2 = this.cellIndex(row + 1, col);
            let index3 = this.cellIndex(row, col - 1);
            let index4 = this.cellIndex(row, col + 1);
            if (this.activeCells.indexOf(index1) != -1 ||
                this.activeCells.indexOf(index2) != -1 ||
                this.activeCells.indexOf(index3) != -1 ||
                this.activeCells.indexOf(index4) != -1)
                return true;
            else
                return false;
        }
        updateActiveRegion() {
            this.activeCells = [];
            for (let element of this.board.children) {
                let cell = element;
                if (cell.state == 1 && cell.player == this.current_player) {
                    this.activeCells.push(this.cellIndex(cell.row, cell.col));
                    this.activateNeighboursOf(cell.row, cell.col);
                }
            }
        }
        activateNeighboursOf(row, col) {
            this.activateNeighbour(row - 1, col);
            this.activateNeighbour(row + 1, col);
            this.activateNeighbour(row, col - 1);
            this.activateNeighbour(row, col + 1);
        }
        activateNeighbour(row, col) {
            let index = this.cellIndex(row, col);
            if (index >= 0 && index < this.board.children.length && this.activeCells.indexOf(index) == -1) {
                let cell = this.getCellByIndex(index);
                if (cell.state == 2 && cell.player == this.current_player) {
                    this.activeCells.push(index);
                    this.activateNeighboursOf(row, col);
                }
            }
        }
        updatePossibleMoves() {
            this.possibleMoves = [];
            for (let cell of this.board.children) {
                cell.disablePossibleToMoveTo();
            }
            if (this.current_player.is_first_turn)
                for (let cell of this.board.children)
                    if (this.isTileOnEdge(cell.row, cell.col)
                        && cell.state == 0)
                        cell.makePossibleToMoveTo();
            for (let index of this.activeCells) {
                let cell = this.getCellByIndex(index);
                let row = cell.row;
                let col = cell.col;
                if (!this.isTileOnRightEdge(row, col))
                    this.checkPossibleMove(row, col + 1);
                if (!this.isTileOnLeftEdge(row, col))
                    this.checkPossibleMove(row, col - 1);
                if (!this.isTileOnTopEdge(row, col))
                    this.checkPossibleMove(row - 1, col);
                if (!this.isTileOnBottomEdge(row, col))
                    this.checkPossibleMove(row + 1, col);
            }
            if (this.possibleMoves.length == 0 && !this.current_player.is_first_turn) {
                this.infoPanel.gameOver(this.current_player);
            }
        }
        checkPossibleMove(row, col) {
            let index = this.cellIndex(row, col);
            if (index >= 0 && index < this.board.children.length && this.possibleMoves.indexOf(index) == -1)
                if (this.isCellOccupiable(row, col)) {
                    this.possibleMoves.push(index);
                    this.getCellByIndex(index).makePossibleToMoveTo();
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
    class InfoPanel extends Phaser.Text {
        constructor(game, x, y) {
            super(game, x, y, null);
            this.anchor.set(0.5, 0);
        }
        setInfo(player, left_turns) {
            let str = R.strings['player_info'](left_turns, player.color);
            this.setText(str);
            this.setStyle({
                "fill": player.color,
                "font": "bold 30px Arial"
            });
        }
        gameOver(player) {
            let str = R.strings['game_over'](player.color);
            this.setText(str);
            this.setStyle({
                "fill": player.color,
                "font": "bold 30px Arial"
            });
        }
    }
    VirusGame.InfoPanel = InfoPanel;
})(VirusGame || (VirusGame = {}));
var VirusGame;
(function (VirusGame) {
    class MainMenu extends Phaser.State {
        create() {
            this.logo = this.add.text(this.world.centerX, 100, R.strings['game_name'].toUpperCase(), {
                "fill": "#2ba6b7",
                "font": "bold 60px Arial"
            });
            this.logo.anchor.set(0.5, 0.5);
            this.button = this.add.button(this.world.centerX, 200, 'ui', this.startGame, this, 'blue_button01', 'blue_button03', 'blue_button05');
            this.button.anchor.set(0.5, 0.5);
            this.button_text = this.add.text(0, 0, R.strings['start_game'], {
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
let R = {
    strings: undefined,
    fonts: undefined
};
R.strings = {
    game_name: 'Virus',
    start_game: 'Start game',
    player_info: (left_turns, player_color) => left_turns + " cells more for " + player_color.toString() + " player",
    game_over: (player_color) => "Game Over for " + player_color.toString() + " player"
};
//# sourceMappingURL=app.js.map