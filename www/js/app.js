class DBState extends Phaser.State {
    wait(n) {
        let self = this;
        this.wait_for_callbacks = n;
        this.callbacks_returned = 0;
        this.loadUpdate = function () {
            self.create();
        };
    }
    init(data) {
        this.__data = data;
        this._init(data);
    }
    done() {
        this.callbacks_returned++;
        this.create();
    }
    isDone() {
        return this.callbacks_returned == this.wait_for_callbacks && this.load.hasLoaded;
    }
    create() {
        if (this.isDone())
            this._create();
    }
    _create() {
    }
    _init(data) {
    }
}
var VirusGame;
(function (VirusGame) {
    window.onload = () => {
        game = new VirusGame.Game();
    };
})(VirusGame || (VirusGame = {}));
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
            this.board_game = board_game;
            this.state = 0;
            this.isPossibleToMoveTo = false;
            this.inputEnabled = true;
            this.input.useHandCursor = true;
            this.events.onInputOver.add(this.drawUnderPointer, this);
            this.events.onInputOut.add(this.drawNormal, this);
            this.events.onInputUp.add(function () {
                if (this.board_game.current_player.is_local_player)
                    this.cellPlayed();
            }, this);
        }
        setState(state, player) {
            this.state = state;
            this.player = player;
            switch (this.state) {
                case 1:
                    this.frameName = this.player.color + '_boxCross';
                    break;
                case 2:
                    this.frameName = this.player.color + '_boxCheckmark';
                    break;
            }
        }
        cellPlayed(opponentTurn) {
            if (this.board_game.isTurnLegal(this.row, this.col)) {
                switch (this.state) {
                    case 0:
                        this.frameName = this.board_game.current_player_color + '_boxCross';
                        this.state = 1;
                        this.player = this.board_game.current_player;
                        this.board_game.endTurn();
                        if (!opponentTurn)
                            VirusGame.client.player_move(this.board_game.id, this.row, this.col, 1, this.board_game.left_turn_cells, this.board_game.current_player_number, this.player.state, 0);
                        break;
                    case 1:
                        this.frameName = this.board_game.current_player_color + '_boxCheckmark';
                        this.state = 2;
                        this.player = this.board_game.current_player;
                        this.board_game.endTurn();
                        if (!opponentTurn)
                            VirusGame.client.player_move(this.board_game.id, this.row, this.col, 2, this.board_game.left_turn_cells, this.board_game.current_player_number, this.player.state, 0);
                        break;
                    case 2:
                        break;
                }
            }
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
    class BoardGame extends DBState {
        constructor() {
            super(...arguments);
            this.activeCells = [];
            this.possibleMoves = [];
        }
        _init(GameID) {
            this.id = GameID;
        }
        preload() {
            this.wait(3);
            VirusGame.client.start_play(this.id);
            let back = VirusGame.game.add.button(50, 50, 'arrow_back', function () {
                VirusGame.game.state.back();
            });
            back.width = back.height = 40;
            this.load.atlasJSONHash('board_cells', 'assets/board_cells.png', 'assets/board_cells.json');
        }
        setInfo(data) {
            this.game_info = data;
            this.done();
        }
        setPlayers(data) {
            this.players_list = data;
            this.number_of_players = data.length;
            this.done();
        }
        setBoardData(data) {
            this.board_state = data;
            this.done();
        }
        _create() {
            this.addPlayers();
            this.initGame();
            this.drawBoard();
            this.drawInfo();
            this.setBoardState();
        }
        drawInfo() {
            this.infoPanel = this.add.existing(new VirusGame.InfoPanel(this.game, this.world.centerX, 10));
            this.infoPanel.setInfo(this.current_player, this.left_turn_cells);
        }
        setBoardState() {
            for (let cell of this.board_state) {
                this.board_cells[cell['x']][cell['y']].setState(cell['state'], this.players[cell['player']]);
                this.players[cell['player']].is_first_turn = false;
            }
            this.current_player_number = this.game_info['current_player'];
            this.left_turn_cells = this.game_info['player_cells_left'];
            this.active_players = [];
            for (let i in this.players) {
                let player = this.players[i];
                if (player.is_alive) {
                    this.active_players.push(player.state);
                }
            }
            this.number_of_players = this.active_players.length;
            this.updateInfoPanel();
            this.updateActiveRegion();
            this.updatePossibleMoves(true);
        }
        drawBoard() {
            this.board = this.add.group();
            this.board_cells = [];
            for (let row = 0; row < 10; row++) {
                this.board_cells.push([]);
                for (let col = 0; col < 10; col++) {
                    let cell = this.addCell(row, col);
                    this.board_cells[row].push(cell);
                }
            }
            this.board.align(10, 10, 40, 40);
            this.board.alignIn(this.world.bounds, Phaser.CENTER);
        }
        addCell(row, col) {
            let cell = new VirusGame.BoardCell(row, col, this);
            if (this.isTileOnEdge(row, col))
                cell.makePossibleToMoveTo();
            this.board.add(cell);
            return cell;
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
            this.active_players = [];
            for (let i in this.players_list) {
                let player_data = this.players_list[i];
                let user_id = player_data['user_id'];
                let is_alive = player_data['is_alive'];
                let player_number = parseInt(player_data['player_state']);
                let player_color = BoardGame.colors[player_data['player_color']];
                let player = new VirusGame.BoardPlayer(user_id, player_color, player_number, is_alive);
                this.active_players.push(player_number);
                this.players[player_number] = player;
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
            this.updateInfoPanel();
            this.updateActiveRegion();
            this.updatePossibleMoves();
        }
        checkTurnChange() {
            if (this.left_turn_cells == 0) {
                if (this.current_player.is_first_turn)
                    this.current_player.is_first_turn = false;
                this.activeCells = [];
                this.current_player_number = this.active_players[(this.active_players.indexOf(this.current_player_number) + 1) % this.number_of_players];
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
        updatePossibleMoves(initial = false) {
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
                if (initial)
                    return;
                VirusGame.client.player_defeated(this.id, this.current_player.id);
                if (this.number_of_players > 2) {
                    let defeated_player = this.active_players.indexOf(this.current_player_number);
                    this.left_turn_cells = 1;
                    this.endTurn();
                    this.number_of_players -= 1;
                    this.active_players.splice(defeated_player, 1);
                }
                else {
                    let defeated_player = this.active_players.indexOf(this.current_player_number);
                    this.active_players.splice(defeated_player, 1);
                    VirusGame.client.game_over(this.id, this.players[this.active_players[0]].id);
                }
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
        opponentTurn(userID, row, col, state) {
            this.getCellByCoords(row, col).cellPlayed(true);
        }
        updateInfoPanel() {
            this.infoPanel.setInfo(this.current_player, this.left_turn_cells);
        }
    }
    BoardGame.colors = ['red', 'blue', 'yellow', 'green', 'black', 'purple'];
    VirusGame.BoardGame = BoardGame;
})(VirusGame || (VirusGame = {}));
var VirusGame;
(function (VirusGame) {
    class BoardPlayer {
        constructor(id, color, state, is_alive) {
            this.id = id;
            this.color = color;
            this.state = state;
            this.is_alive = is_alive;
            this.is_first_turn = true;
            this.is_local_player = id === VirusGame.client.user_id;
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
    class Client {
        constructor() {
            let _this = this;
            this.socket = io();
            this.socket.on('onConnected', function (data) {
                _this.id = data.id;
            });
            this.socket.on('player_move', function (userID, row, col, state) {
                let game_state = (VirusGame.game.state.getCurrentState());
                if (userID !== VirusGame.client.user_id)
                    game_state.opponentTurn(userID, row, col, state);
            });
            this.socket.on('user_login_results', function (user) {
                _this.perform_login(user);
            });
            this.socket.on('user_register_results', function (user) {
                _this.perform_login(user);
            });
            this.socket.on('load_games_results', function (games) {
                VirusGame.game.state.getCurrentState().setGames(games);
            });
            this.socket.on('load_game_info', function (info) {
                VirusGame.game.state.getCurrentState().setInfo(info);
            });
            this.socket.on('load_game_players', function (players) {
                VirusGame.game.state.getCurrentState().setPlayers(players);
            });
            this.socket.on('joined', function (GameID) {
                VirusGame.game.state.restart(true, false, GameID);
            });
            this.socket.on('left', function (GameID) {
                VirusGame.game.state.restart(true, false, GameID);
            });
            this.socket.on('deleted', function (GameID) {
                VirusGame.game.state.back();
            });
            this.socket.on('load_game_board', function (data) {
                VirusGame.game.state.getCurrentState().setBoardData(data);
            });
        }
        perform_login(user) {
            if (user.length == 1) {
                this.user_id = user[0].id;
                VirusGame.game.state.start('MainMenu', true, false);
            }
        }
        host_game(max_players) {
            this.socket.emit('host game', this.user_id, max_players);
        }
        player_move(gameID, row, col, state, cellsLeft, currentPlayer, playerMoved, usersLost) {
            this.socket.emit('player move', this.user_id, gameID, row, col, state, cellsLeft, currentPlayer, playerMoved, usersLost);
        }
        emit(type) {
            this.socket.emit('m', type, this.id);
        }
        findGame() {
            this.emit('findGame');
        }
        login(login, password) {
            this.socket.emit('user login', login, password);
        }
        register(login, password) {
            this.socket.emit('user register', login, password);
        }
        load_my_games() {
            this.socket.emit('load my games', this.user_id);
        }
        load_joinable_games() {
            this.socket.emit('load joinable games', this.user_id);
        }
        preview_game(GameID) {
            this.socket.emit('load game info', GameID);
            this.socket.emit('load game players', GameID);
        }
        join(GameID, player_color) {
            this.socket.emit('join game', this.user_id, GameID, player_color);
        }
        leave(GameID) {
            this.socket.emit('leave game', this.user_id, GameID);
        }
        delete(GameID) {
            this.socket.emit('delete game', this.user_id, GameID);
        }
        start_play(GameID) {
            this.socket.emit('load game players', GameID);
            this.socket.emit('load game info', GameID);
            this.socket.emit('load game board', GameID);
        }
        player_defeated(game_id, player_id) {
            if (this.user_id == player_id)
                this.socket.emit('player defeated', game_id, player_id);
        }
        game_over(game_id, winner_id) {
            if (this.user_id == winner_id)
                this.socket.emit('finish game', game_id, winner_id);
        }
    }
    VirusGame.Client = Client;
})(VirusGame || (VirusGame = {}));
var VirusGame;
(function (VirusGame) {
    class Game extends Phaser.Game {
        constructor() {
            super(800, 600, Phaser.AUTO, 'content', null);
            VirusGame.game = this;
            VirusGame.ui = new UIPlugin.Plugin(VirusGame.game);
            this.state.add('Boot', VirusGame.Boot, false);
            this.state.add('Preloader', VirusGame.Preloader, false);
            this.state.add('Login', VirusGame.Login, false);
            this.state.add('MainMenu', VirusGame.MainMenu, false);
            this.state.add('CreateGame', VirusGame.CreateGame, false);
            this.state.add('GamesList', VirusGame.GamesList, false);
            this.state.add('GamePreview', VirusGame.GamePreview, false);
            this.state.add('BoardGame', VirusGame.BoardGame, false);
            this.state.start('Boot');
        }
    }
    VirusGame.Game = Game;
})(VirusGame || (VirusGame = {}));
var VirusGame;
(function (VirusGame) {
    class GamePreview extends DBState {
        _init(GameID) {
            this.id = GameID;
        }
        preload() {
            this.wait(2);
            VirusGame.client.preview_game(this.id);
            let back = VirusGame.game.add.button(50, 50, 'arrow_back', function () {
                VirusGame.game.state.back();
            });
            back.width = back.height = 40;
            this.load.atlasJSONHash('board_cells', 'assets/board_cells.png', 'assets/board_cells.json');
        }
        _create() {
            this.info_group = VirusGame.game.add.group();
            this.info_group.y = 100;
            this.add.text(0, 0, R.strings['game#'] + this.id, R.fonts['white_1'], this.info_group);
            this.add.text(0, 0, R.strings['player_count'] + ':' + this.info['max_players'], R.fonts['white_1'], this.info_group);
            this.add.text(0, 0, R.strings['players'], R.fonts['white_1'], this.info_group);
            this.players.forEach(function (player, i) {
                this.add.text(0, 0, player['username'], R.fonts['player_name_1'](VirusGame.BoardGame.colors[player['player_color']]), this.info_group);
            }, this);
            this.info_group.align(1, -1, VirusGame.game.world.width, 30, Phaser.CENTER);
            let b_text;
            let b_callback;
            if (this.info['players'] < this.info['max_players']) {
                if (!this.clientAlreadyJoined()) {
                    b_text = R.strings['join'];
                    b_callback = this.join;
                    this.drawColorButtons();
                    this.setActiveColor(0);
                }
                else if (this.info['players'] != 1) {
                    b_text = R.strings['leave'];
                    b_callback = this.leave;
                }
                else {
                    b_text = R.strings['delete'];
                    b_callback = this.delete;
                }
            }
            else {
                b_text = R.strings['play'];
                b_callback = this.play;
            }
            let button = VirusGame.ui.add.text_button(0, 0, b_callback, this, b_text, R.fonts['white_1'])
                .alignIn(VirusGame.game.world.bounds, Phaser.BOTTOM_CENTER, 0, -100);
        }
        setPlayers(players) {
            this.players = players;
            this.done();
        }
        setInfo(info) {
            this.info = info;
            this.done();
        }
        clientAlreadyJoined() {
            return this.players.some((element, index, array) => element.user_id == VirusGame.client.user_id);
        }
        join() {
            VirusGame.client.join(this.id, this.activeColor);
        }
        leave() {
            VirusGame.client.leave(this.id);
        }
        delete() {
            VirusGame.client.delete(this.id);
        }
        play() {
            VirusGame.game.state.start('BoardGame', true, false, this.id);
        }
        drawColorButtons() {
            this.colorButtonGroup = this.add.group();
            VirusGame.BoardGame.colors.forEach(function (color, i) {
                this.add.button(0, 0, 'board_cells', function () {
                    this.setActiveColor(i);
                }.bind(this), this, 'grey_box', color + '_boxCheckmark', '', '', this.colorButtonGroup);
            }, this);
            this.colorButtonGroup.align(-1, 1, 40, 40);
            this.colorButtonGroup.alignIn(VirusGame.game.world.bounds, Phaser.BOTTOM_CENTER, 0, -200);
        }
        setActiveColor(i) {
            if (this.activeColor != null)
                this.colorButtonGroup.getAt(this.activeColor).tint = 0xffffff;
            this.activeColor = i;
            this.colorButtonGroup.getAt(i).tint = 0xaaaaaa;
        }
    }
    VirusGame.GamePreview = GamePreview;
})(VirusGame || (VirusGame = {}));
var VirusGame;
(function (VirusGame) {
    class GamesList extends DBState {
        constructor() {
            super(...arguments);
            this.sprite = "scrollbar";
        }
        _init(type) {
            this.type = type;
        }
        preload() {
            this.load.atlasJSONHash('scrollbar', 'assets/scrollbar.png', 'assets/scrollbar.json');
            this.wait(1);
            if (this.type == 'join')
                VirusGame.client.load_joinable_games();
            else if (this.type == 'resume')
                VirusGame.client.load_my_games();
            let back = VirusGame.game.add.button(50, 50, 'arrow_back', function () {
                VirusGame.game.state.back();
            });
            back.width = back.height = 40;
        }
        _create() {
            let gr = VirusGame.game.add.group();
            let layout = new UIPlugin.SliderLayout({
                parent: this,
                container: gr,
                bg: new Phaser.Rectangle(0, 0, 580, 260),
                show_item: this.show_game,
                position: [100, 170],
                slider_position: [590, 0],
                cols: 1,
                item_size: [190, 50],
                items_offset: [0, 20]
            });
            layout.update_items(this.items);
        }
        setGames(games) {
            this.items = games;
            this.done();
        }
        show_game(item, data, cell) {
            let gameInfo = R.strings['game#'] + data.id;
            if (data.PlayersCount)
                gameInfo += ' (' + data.players + '/' + data.max_players + ')';
            let button = VirusGame.ui.add.text_button(0, 0, this.open_game, this, gameInfo, R.fonts['white_1'], item);
            button.button.data.id = data.id;
        }
        open_game(b) {
            VirusGame.game.state.start('GamePreview', true, false, b.data.id);
        }
    }
    VirusGame.GamesList = GamesList;
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
    class Login extends Phaser.State {
        preload() {
            this.load.atlasXML('ui', 'assets/ui.png', 'assets/ui.xml');
            this.game.add.plugin(PhaserInput.Plugin, []);
            let state_manager = VirusGame.game.state;
            state_manager.history = [];
            VirusGame.game.state.onStateChange.add(function (newState, oldState) {
                if (newState == oldState)
                    return;
                if (!state_manager.returning) {
                    let s = [newState];
                    if (VirusGame.game.state.getCurrentState()['__data'])
                        s.push(VirusGame.game.state.getCurrentState()['__data']);
                    this.history.push(s);
                }
                else
                    state_manager.returning = false;
            }, VirusGame.game.state);
            state_manager.back = function () {
                state_manager.history.pop();
                let last_state = state_manager.history[state_manager.history.length - 1];
                state_manager.returning = true;
                VirusGame.game.state.start(last_state[0], true, false, last_state.length > 0 ? last_state[1] : null);
            };
        }
        create() {
            this.loginInput = this.game.add.inputField(0, 0, {
                width: 200,
                padding: 8,
                borderWidth: 1,
                borderColor: '#000',
                borderRadius: 6,
                placeHolder: 'login',
            });
            this.loginInput.onEnterCallback = [function () {
                    this.loginInput.endFocus();
                    this.passInput.startFocus();
                }, this];
            this.loginInput.alignIn(this.game.world.bounds, Phaser.TOP_CENTER, 0, -215);
            this.passInput = this.game.add.inputField(0, 0, {
                width: 200,
                padding: 8,
                borderWidth: 1,
                borderColor: '#000',
                borderRadius: 6,
                placeHolder: 'password',
                type: PhaserInput.InputType.password
            });
            this.passInput.alignIn(this.game.world.bounds, Phaser.TOP_CENTER, 0, -250);
            this.passInput.onEnterCallback = [function () {
                    this.passInput.endFocus();
                    this.login();
                }, this];
            let gr = VirusGame.game.add.group();
            VirusGame.ui.add.text_button(0, 315, this.login, this, R.strings['login'], R.fonts['white_1'], gr)
                .alignTo(this.passInput, Phaser.BOTTOM_CENTER, 8, 10);
            VirusGame.ui.add.text_button(0, 370, this.register, this, R.strings['register'], R.fonts['white_1'], gr)
                .alignTo(this.passInput, Phaser.BOTTOM_CENTER, 8, 60);
        }
        login() {
            let login = this.loginInput.value;
            let password = this.passInput.value;
            VirusGame.client.login(login, password);
        }
        register() {
            let login = this.loginInput.value;
            let password = this.passInput.value;
            VirusGame.client.register(login, password);
        }
    }
    VirusGame.Login = Login;
})(VirusGame || (VirusGame = {}));
var VirusGame;
(function (VirusGame) {
    class MainMenu extends Phaser.State {
        preload() {
            this.load.image('arrow_back', 'assets/arrowLeft.png');
        }
        create() {
            this.logo = this.add.text(this.world.centerX, 100, R.strings['game_name'].toUpperCase(), R.fonts['blue_1']);
            this.logo.anchor.set(0.5, 0.5);
            VirusGame.ui.add.text_button(0, 0, this.createGame, this, R.strings['create_game'], R.fonts['white_1'])
                .alignIn(VirusGame.game.camera.bounds, Phaser.TOP_CENTER, 0, -200);
            VirusGame.ui.add.text_button(0, 0, this.joinGame, this, R.strings['join_game'], R.fonts['white_1'])
                .alignIn(VirusGame.game.camera.bounds, Phaser.TOP_CENTER, 0, -250);
            VirusGame.ui.add.text_button(0, 0, this.resumeGame, this, R.strings['resume_game'], R.fonts['white_1'])
                .alignIn(VirusGame.game.camera.bounds, Phaser.TOP_CENTER, 0, -300);
        }
        createGame() {
            this.game.state.start('CreateGame', true, false);
        }
        joinGame() {
            this.game.state.start('GamesList', true, false, 'join');
        }
        resumeGame() {
            this.game.state.start('GamesList', true, false, 'resume');
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
            VirusGame.client = new VirusGame.Client();
        }
        create() {
            let tween = this.add.tween(this.preloadBar).to({ alpha: 0 }, 100, Phaser.Easing.Linear.None, true);
            tween.onComplete.add(this.startMainMenu, this);
        }
        startMainMenu() {
            this.game.state.start('Login', true, false);
        }
    }
    VirusGame.Preloader = Preloader;
})(VirusGame || (VirusGame = {}));
let R = {
    strings: undefined,
    fonts: undefined
};
R.fonts = {
    blue_1: {
        "fill": "#2ba6b7",
        "font": "bold 60px Arial"
    },
    white_1: {
        "fill": "#fefefe",
        "font": "bold 24px Arial",
        "stroke": "#000000",
        "strokeThickness": 2
    },
    gray_1: {
        "fill": "#aaaaaa",
        "font": "bold 24px Arial",
        "stroke": "#000000",
        "strokeThickness": 2
    },
    player_name_1: function (color) {
        return {
            "fill": color,
            "font": "bold 24px Arial",
            "stroke": "#000000",
            "strokeThickness": 2
        };
    }
};
R.strings = {
    game_name: 'Virus',
    start_game: 'Start game',
    create_game: 'Create game',
    join_game: 'Join game',
    resume_game: 'Resume game',
    login: 'Login',
    register: 'Register',
    'game#': 'Game #',
    'player_count': 'Players',
    'players': 'Players',
    'join': 'Join',
    'leave': 'Leave',
    'delete': 'Delete',
    'play': 'Play',
    'select_players#': 'Select number of players',
    player_info: (left_turns, player_color) => left_turns + " cells more for " + player_color.toString() + " player",
    game_over: (player_color) => "Game Over for " + player_color.toString() + " player"
};
var UIPlugin;
(function (UIPlugin) {
    class Button extends Phaser.Button {
        constructor(game_, x, y, sprite, func, context, base_path, parent = false, button_group = false) {
            super(game_, x, y, sprite);
            if (parent === true)
                parent = context;
            if (parent)
                parent.add(this);
            this.smoothed = false;
            this.base_path = base_path;
            this.func = func;
            this.context = context;
            this.state = 0;
            this.paths = [this.base_path];
            this.funcs = [this.func];
            this.button_group = button_group;
            this.outFrame = 'normal';
            this.onInputUp.add(this.call, this);
            this.setFrames(base_path + 'hover', base_path + 'normal', base_path + 'click');
            this.input.useHandCursor = true;
        }
        setClickedState(name) {
            this.onInputUp.add(function () {
                if (this.button_group) {
                    this.parent.setAll('outFrame', 'normal');
                }
                this.outFrame = name;
                if (this.button_group) {
                    this.parent.callAll('updateFrames');
                }
            }, this, 1);
        }
        setToggleState(sprite, func) {
            this.paths = [this.base_path, sprite];
            this.funcs = [this.func, func];
        }
        setDisabled(val) {
            if (val) {
                this.setFrames(this.base_path + 'inactive', this.base_path + 'inactive', this.base_path + 'inactive');
                this.disabled = true;
            }
            else {
                this.setFrames(this.base_path + 'hover', this.base_path + 'normal', this.base_path + 'click');
                this.disabled = false;
            }
        }
        call() {
            if (this.disabled)
                return;
            let state = this.state;
            this.state = (this.paths.length - 1) - this.state;
            if (this.paths.length > 1) {
                var base_path = this.paths[this.state];
                this.setFrames(base_path + 'hover', base_path + 'normal', base_path + 'click');
            }
            this.funcs[state].apply(this.context, [this]);
        }
        updateFrames() {
            if (this.outFrame != 'normal')
                this.setFrames(this.base_path + this.outFrame, this.base_path + this.outFrame, this.base_path + this.outFrame);
            else
                this.setFrames(this.base_path + 'hover', this.base_path + 'normal', this.base_path + 'click');
        }
    }
    UIPlugin.Button = Button;
})(UIPlugin || (UIPlugin = {}));
var UIPlugin;
(function (UIPlugin) {
    class DataGroup extends Phaser.Group {
        constructor(game_, parent, name, addToStage, enableBody, physicsBodyType) {
            super(game_, parent, name, addToStage, enableBody, physicsBodyType);
        }
    }
    UIPlugin.DataGroup = DataGroup;
})(UIPlugin || (UIPlugin = {}));
var UIPlugin;
(function (UIPlugin) {
    class ObjectFactory {
        constructor(game) {
            this.game = game;
        }
        data_group(parent, name, addToStage, enableBody, physicsBodyType) {
            return new UIPlugin.DataGroup(UIPlugin._game, parent, name, addToStage, enableBody, physicsBodyType);
        }
        button(x, y, sprite, func, context, base_path, parent, button_group) {
            return new UIPlugin.Button(UIPlugin._game, x, y, sprite, func, context, base_path, parent, button_group);
        }
        text_button(x, y, callback, scope, text, font, parent, frames) {
            return new UIPlugin.TextButton(UIPlugin._game, x, y, callback, scope, text, font, parent, frames);
        }
        slider(x, y, key, frame, group) {
            let slider = new UIPlugin.Slider(UIPlugin._game, x, y, key, frame);
            group.add(slider);
            return slider;
        }
    }
    ;
    class Plugin {
        constructor(game) {
            this.game = game;
            UIPlugin._game = game;
            this.add = new ObjectFactory(game);
            UIPlugin.objectFactory = this.add;
        }
    }
    UIPlugin.Plugin = Plugin;
})(UIPlugin || (UIPlugin = {}));
var UIPlugin;
(function (UIPlugin) {
    class TextButton extends Phaser.Group {
        constructor(game_, x, y, callback, scope, text, font, parent, frames) {
            super(game_, parent);
            frames = frames ? frames : ['blue_button01', 'blue_button03', 'blue_button05', 'blue_button01'];
            this.button = UIPlugin._game.add.button(x, y, 'ui', callback, scope, frames[0], frames[1], frames[2], frames[3], this);
            this.button_text = UIPlugin._game.add.text(0, 0, text, font, this);
            this.button_text.alignIn(this.button, Phaser.CENTER);
        }
    }
    UIPlugin.TextButton = TextButton;
})(UIPlugin || (UIPlugin = {}));
var UIPlugin;
(function (UIPlugin) {
    class Slider extends Phaser.Image {
        constructor(game, x, y, key, frame) {
            super(game, x, y, key, frame);
        }
    }
    UIPlugin.Slider = Slider;
    class SliderLayout extends Phaser.Group {
        constructor(config) {
            super(UIPlugin._game);
            this.config = config;
            this.config = config;
            this.config.container.add(this);
            this.x = config.position[0];
            this.y = config.position[1];
            this.init_ui();
            this.init_events();
        }
        init_ui() {
            let config = this.config;
            let self = this;
            let bg = typeof (config.bg) == typeof ('') ? UIPlugin._game.add.image(0, 0, config.parent.sprite, config.bg, this) : config.bg;
            let items_group = UIPlugin._game.add.group(this);
            let grid_cell = new Phaser.Rectangle(0, 0, config.item_size[0], config.item_size[1]);
            this.bg = bg;
            this.grid_cell = grid_cell;
            this.items_group = items_group;
            let mask = UIPlugin._game.add.graphics(config.container.cameraOffset.x + config.position[0], config.container.cameraOffset.y + config.position[1]);
            mask.fixedToCamera = true;
            mask.beginFill(0xffffff);
            mask.drawRect(config.items_offset[0], config.items_offset[1], bg.width - 2 * config.items_offset[0], bg.height - 2 * config.items_offset[1]);
            items_group.mask = mask;
            let slider = UIPlugin._game.add.group(this);
            slider.x = config.slider_position[0];
            slider.y = config.slider_position[1];
            let slider_bg = UIPlugin._game.add.image(0, 0, config.parent.sprite, 'way', slider);
            let b_up = UIPlugin.objectFactory.button(0, 0, config.parent.sprite, this.slide_down, this, 'arrow/up_', slider);
            let b_down = UIPlugin.objectFactory.button(0, bg.height - b_up.height, config.parent.sprite, this.slide_up, this, 'arrow/down_', slider);
            slider_bg.crop(new Phaser.Rectangle(0, 0, slider_bg.width, bg.height - b_up.height));
            slider_bg.alignTo(b_up, Phaser.BOTTOM_CENTER, 0, -b_up.height / 2 | 0);
            let _slider = UIPlugin.objectFactory.slider(0, 0, config.parent.sprite, 'scrolling/normal', slider);
            _slider.inputEnabled = true;
            _slider.input.enableDrag();
            _slider.min_y = b_up.y + b_up.height;
            _slider.max_y = b_down.y - (b_up.y + b_up.height);
            _slider.max_abs_y = _slider.max_y - _slider.height;
            _slider.input.boundsRect = new Phaser.Rectangle(b_up.width / 2 - _slider.width / 2 | 0, _slider.min_y, _slider.width, _slider.max_y);
            _slider.x = b_up.width / 2 - _slider.width / 2 | 0;
            _slider.y = _slider.min_y;
            _slider.input.useHandCursor = true;
            _slider.events.onInputOver.add(function () {
                _slider.frameName = 'scrolling/hover';
            }, this);
            _slider.events.onInputOut.add(function () {
                _slider.frameName = 'scrolling/normal';
            }, this);
            _slider.events.onInputDown.add(function () {
                _slider.frameName = 'scrolling/click';
            }, this);
            _slider.events.onInputUp.add(function () {
                _slider.frameName = 'scrolling/hover';
            }, this);
            _slider.events.onDragUpdate.add(function (img) {
                let pos = (img.y - img.min_y) / img.max_abs_y;
                self.layout_move(pos);
            });
            this._slider = _slider;
            if (config.data)
                this.update_items(config.data);
        }
        update_items(data) {
            let items_group = this.items_group;
            let config = this.config;
            let self = this;
            items_group.removeAll(true);
            let item_group;
            for (let item_data of data) {
                item_group = UIPlugin._game.add.group(items_group);
            }
            ;
            items_group.align(config.cols, -1, config.item_size[0], config.item_size[1]);
            items_group.y = config.items_offset[1];
            items_group.x = (this.bg.width - config.item_size[0] * config.cols) / 2 + config.items_offset[0] | 0;
            data.forEach((item_data, i) => {
                let item_group = items_group.getAt(i);
                item_group.data = item_data;
                config.show_item.apply(config.parent, [item_group, item_data, self.grid_cell, i]);
            });
            for (let i in data) {
            }
            ;
            this._slider.y = this._slider.min_y;
        }
        layout_move(pos) {
            if (this.scroll_tween) {
                this.scroll_tween.stop();
                this.scroll_slider_tween.stop();
            }
            let dbottom = (this.items_group.y + this.items_group.height) - (this.bg.height - 2 * this.config.items_offset[1]);
            if (dbottom < 0)
                return;
            this.items_group.y = this.config.items_offset[1] - (this.items_group.height - this.items_group.mask.height) * pos;
        }
        slide_up() {
            if (this.scroll_tween) {
                this.scroll_tween.stop();
                this.scroll_slider_tween.stop();
            }
            let dy = this.config.item_size[1];
            let dbottom = (this.items_group.y + this.items_group.height) - (this.bg.height - 2 * this.config.items_offset[1]);
            if (dbottom < 0)
                return;
            if (dbottom < dy)
                dy = dbottom;
            let rel_y = (this.items_group.height - this.items_group.mask.height);
            let pos = (this.items_group.y - dy) / rel_y;
            this.scroll_tween = UIPlugin._game.add.tween(this.items_group).to({ y: this.items_group.y - dy }, 200, Phaser.Easing.Cubic.Out, true);
            this.scroll_slider_tween = UIPlugin._game.add.tween(this._slider).to({ y: this._slider.min_y - this._slider.max_abs_y * pos }, 200, Phaser.Easing.Cubic.Out, true);
        }
        slide_down() {
            if (this.scroll_tween) {
                this.scroll_tween.stop();
                this.scroll_slider_tween.stop();
            }
            let dy = this.config.item_size[1];
            let dtop = this.config.items_offset[1] - this.items_group.y;
            if (dtop < dy)
                dy = dtop;
            let rel_y = (this.items_group.height - this.items_group.mask.height);
            let pos = (this.items_group.y + dy - this.config.items_offset[1]) / rel_y;
            this.scroll_tween = UIPlugin._game.add.tween(this.items_group).to({ y: this.items_group.y + dy }, 200, Phaser.Easing.Cubic.Out, true);
            this.scroll_slider_tween = UIPlugin._game.add.tween(this._slider).to({ y: this._slider.min_y - this._slider.max_abs_y * pos }, 200, Phaser.Easing.Cubic.Out, true);
        }
        init_events() {
            let self = this;
            UIPlugin._game.input.mouse.mouseWheelCallback = function () {
                if (UIPlugin._game.input.mouse.wheelDelta === Phaser.Mouse.WHEEL_UP) {
                    self.slide_down();
                }
                else {
                    self.slide_up();
                }
            };
        }
    }
    UIPlugin.SliderLayout = SliderLayout;
})(UIPlugin || (UIPlugin = {}));
var VirusGame;
(function (VirusGame) {
    class CreateGame extends Phaser.State {
        constructor() {
            super(...arguments);
            this.game_params = {};
        }
        preload() {
            let back = VirusGame.game.add.button(50, 50, 'arrow_back', function () {
                VirusGame.game.state.back();
            });
            back.width = back.height = 40;
            this.load.atlasJSONHash('board_cells', 'assets/board_cells.png', 'assets/board_cells.json');
        }
        create() {
            let gr = VirusGame.game.add.group();
            gr.y = 100;
            this.add.text(0, 0, R.strings['select_players#'], R.fonts['white_1'], gr);
            this.players_num_gr = VirusGame.game.add.group(gr);
            for (let i = 2; i <= 6; i++) {
                VirusGame.ui.add.text_button(0, 0, function (b) {
                    this.changePlayersNumber(i, b);
                }, this, String(i), R.fonts['white_1'], this.players_num_gr, [
                    'blue_button06', 'blue_button06', 'blue_button06', 'blue_button06'
                ]);
            }
            this.players_num_gr.align(-1, 1, 52, 40, Phaser.CENTER);
            this.changePlayersNumber(2, this.players_num_gr.getAt(0).button);
            gr.align(1, -1, VirusGame.game.world.width, 50, Phaser.CENTER);
            VirusGame.ui.add.text_button(0, 0, this.host, this, R.strings['create_game'], R.fonts['white_1'])
                .alignIn(VirusGame.game.camera.bounds, Phaser.TOP_CENTER, 0, -450);
        }
        host() {
            VirusGame.client.host_game(this.game_params['max_players']);
        }
        changePlayersNumber(n, b) {
            this.players_num_gr.forEach(function (text_button) {
                text_button.button_text.setStyle(R.fonts['white_1']);
            }, this);
            b.parent.button_text.setStyle(R.fonts['gray_1']);
            this.game_params['max_players'] = n;
        }
        drawColorButtons() {
            this.colorButtonGroup = this.add.group();
            VirusGame.BoardGame.colors.forEach(function (color, i) {
                this.add.button(0, 0, 'board_cells', function () {
                    this.setActiveColor(i);
                }.bind(this), this, 'grey_box', color + '_boxCheckmark', '', '', this.colorButtonGroup);
            }, this);
            this.colorButtonGroup.alignIn(VirusGame.game.world.bounds, Phaser.BOTTOM_CENTER, 0, -200);
            ;
            this.colorButtonGroup.align(-1, 1, 40, 40);
        }
        setActiveColor(i) {
            if (this.activeColor != null)
                this.colorButtonGroup.getAt(this.activeColor).tint = 0xffffff;
            this.activeColor = i;
            this.colorButtonGroup.getAt(i).tint = 0xaaaaaa;
        }
    }
    VirusGame.CreateGame = CreateGame;
})(VirusGame || (VirusGame = {}));
//# sourceMappingURL=app.js.map