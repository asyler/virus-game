module VirusGame {
    export class BoardGame extends DBState {

        number_of_players: number;
        current_player_number: number;
        left_turn_cells: number;
        activeCells: Array<number> = [];
        possibleMoves: Array<number> = [];

        board: Phaser.Group;
        active_players: Array<number>;
        players: Array<BoardPlayer>;
        infoPanel: InfoPanel;

        static colors: Array<string> = ['blue', 'yellow'];
        id: number;
        private board_state;
        private board_cells;
        private players_list;
        private game_info;

        _init(GameID) {
            this.id = GameID;
        }

        preload() {
            this.wait(3);
            client.start_play(this.id);
            let back = game.add.button(50,50,'arrow_back',function () {
                (<StateManager>game.state).back();
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

        private drawInfo() {
            this.infoPanel = this.add.existing(new InfoPanel(this.game, this.world.centerX, 10));
            this.infoPanel.setInfo(this.current_player, this.left_turn_cells);
        }

        private setBoardState() {
            for (let cell of this.board_state) {
                this.board_cells[cell['x']][cell['y']].setState(cell['state'],this.players[cell['player']]);
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

        private drawBoard() {
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

        private addCell(row: number, col: number) {
            let cell = new BoardCell(row, col, this);
            if (this.isTileOnEdge(row, col))
                cell.makePossibleToMoveTo();
            this.board.add(cell);
            return cell;
        }

        private cellIndex(row: number, col: number): number {
            let index = 10 * row + col;
            return index;
        }

        public getCellByCoords(row: number, col: number): BoardCell {
            return this.getCellByIndex(this.cellIndex(row, col));
        }

        private getCellByIndex(index: number): BoardCell {
            return <BoardCell>this.board.getAt(index);
        }

        private addPlayers() {
            this.players = [];
            this.active_players = [];
            for (let i in this.players_list) {
                let player_data = this.players_list[i];
                let user_id = player_data['user_id'];
                let is_alive = player_data['is_alive'];
                let player_number = parseInt(player_data['player_state']);
                let player_color = BoardGame.colors[player_data['player_color']];
                let player = new BoardPlayer(user_id, player_color, player_number, is_alive);
                this.active_players.push(player_number);
                this.players[player_number] = player;
            }
        }

        private initGame() {
            this.current_player_number = 0;
            this.left_turn_cells = 1;
        }


        get current_player() {
            return this.players[this.current_player_number];
        }

        get current_player_color(): string {
            return this.players[this.current_player_number].color;
        }

        endTurn() {
            this.left_turn_cells--;
            this.checkTurnChange();

            this.updateInfoPanel();
            this.updateActiveRegion();
            this.updatePossibleMoves();
        }

        private checkTurnChange() {
            if (this.left_turn_cells == 0) {
                if (this.current_player.is_first_turn)
                    this.current_player.is_first_turn = false;

                this.activeCells = [];

                this.current_player_number = this.active_players[(this.active_players.indexOf(this.current_player_number)+ 1) % this.number_of_players];

                if (this.current_player.is_first_turn)
                    this.left_turn_cells = 1;
                else
                    this.left_turn_cells = 3;

            }
        }

        isTurnLegal(row: number, col: number): boolean {
            let cell = this.getCellByCoords(row, col);

            if (this.current_player.is_first_turn)
                if (cell.state == CellState.Empty)
                    return this.isTileOnEdge(row, col);
                else
                    return false;

            if (this.isCellOccupiable(row, col))
                if (this.isAnyNeighbourActive(row, col))
                    return true;
                else
                    return false;
        }

        private isCellOccupiable(row: number, col: number) {
            let cell = this.getCellByCoords(row, col);
            return cell.state == CellState.Empty || cell.state == CellState.Alive && cell.player != this.current_player;
        }

        private isTileOnEdge(row: number, col: number): boolean {
            return this.isTileOnRightEdge(row, col) || this.isTileOnLeftEdge(row, col) ||
                this.isTileOnTopEdge(row, col) || this.isTileOnBottomEdge(row, col);
        }
        private isTileOnRightEdge(row: number, col: number): boolean {
            return col == 9;
        }
        private isTileOnLeftEdge(row: number, col: number): boolean {
            return col == 0;
        }
        private isTileOnTopEdge(row: number, col: number): boolean {
            return row == 0;
        }
        private isTileOnBottomEdge(row: number, col: number): boolean {
            return row == 9;
        }

        private isAnyNeighbourActive(row: number, col: number): boolean {
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

        private updateActiveRegion() {
            this.activeCells = [];

            for (let element of this.board.children) {
                let cell = <BoardCell>element;

                if (cell.state == CellState.Alive && cell.player == this.current_player) {
                    this.activeCells.push(this.cellIndex(cell.row, cell.col));
                    this.activateNeighboursOf(cell.row, cell.col);
                }
            }
        }

        private activateNeighboursOf(row: number, col: number) {
            this.activateNeighbour(row - 1, col);
            this.activateNeighbour(row + 1, col);
            this.activateNeighbour(row, col - 1);
            this.activateNeighbour(row, col + 1);
        }

        private activateNeighbour(row: number, col: number) {
            let index = this.cellIndex(row, col);

            if (index >= 0 && index < this.board.children.length && this.activeCells.indexOf(index) == -1) {
                let cell = this.getCellByIndex(index);
                if (cell.state == CellState.Dead && cell.player == this.current_player) {
                    this.activeCells.push(index);
                    this.activateNeighboursOf(row, col);
                }
            }
        }

        private updatePossibleMoves(initial: boolean = false) {
            this.possibleMoves = [];
            for (let cell of this.board.children) {
                (<BoardCell>cell).disablePossibleToMoveTo();
            }

            if (this.current_player.is_first_turn)
                for (let cell of this.board.children)
                    if (this.isTileOnEdge((<BoardCell>cell).row, (<BoardCell>cell).col)
                        && (<BoardCell>cell).state == CellState.Empty)
                        (<BoardCell>cell).makePossibleToMoveTo();

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
                // game over
                this.infoPanel.gameOver(this.current_player);
                if (initial)
                    return;
                client.player_defeated(this.id,this.current_player.id);

                // handle with defeated player
                if (this.number_of_players>2) {// continue to play
                    let defeated_player = this.active_players.indexOf(this.current_player_number);
                    // hmm.. small workaround ;)
                    this.left_turn_cells = 1;
                    this.endTurn();
                    // remove defeated player
                    this.number_of_players -= 1;
                    this.active_players.splice(defeated_player, 1);
                } else {
                    let defeated_player = this.active_players.indexOf(this.current_player_number);
                    this.active_players.splice(defeated_player, 1); // only winner should left
                    client.game_over(this.id,this.players[this.active_players[0]].id);
                }
            }
        }

        private checkPossibleMove(row: number, col: number) {
            let index = this.cellIndex(row, col);

            if (index >= 0 && index < this.board.children.length && this.possibleMoves.indexOf(index) == -1)
                if (this.isCellOccupiable(row, col)) {
                    this.possibleMoves.push(index);
                    this.getCellByIndex(index).makePossibleToMoveTo();
                }
        }

        opponentTurn(userID:number, row:number, col:number, state:number) {
            this.getCellByCoords(row,col).cellPlayed(true);
        }

        private updateInfoPanel() {
            this.infoPanel.setInfo(this.current_player, this.left_turn_cells);

        }
    }
}