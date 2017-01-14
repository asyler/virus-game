module VirusGame {
    export class BoardGame extends Phaser.State {

        number_of_players: number = 2;
        current_player_number: number;
        left_turn_cells: number;
        activeCells: Array<number> = [];
        possibleMoves: Array<number> = [];

        board: Phaser.Group;
        players: Array<BoardPlayer>;
        infoPanel: InfoPanel;

        colors: Array<string> = ['blue', 'yellow'];

        create() {
            this.addPlayers();
            this.initGame();
            this.drawBoard();
            this.drawInfo();
        }

        private drawInfo() {
            this.infoPanel = this.add.existing(new InfoPanel(this.game, this.world.centerX, 10));
            this.infoPanel.setInfo(this.current_player, this.left_turn_cells);
        }

        private drawBoard() {
            this.board = this.add.group();

            for (let row = 0; row < 10; row++) {
                for (let col = 0; col < 10; col++) {
                    this.addCell(row, col);
                }
            }
            this.board.align(10, 10, 38, 36);
            this.board.alignIn(this.world.bounds, Phaser.CENTER);
        }

        private addCell(row: number, col: number) {
            let cell = new BoardCell(row, col, this);
            this.board.add(cell);
        }

        private cellIndex(row: number, col: number): number {
            let index = 10 * row + col;
            return index;
        }

        private getCellByCoords(row: number, col: number): BoardCell {
            return this.getCellByIndex(this.cellIndex(row, col));
        }

        private getCellByIndex(index: number): BoardCell {
            return <BoardCell>this.board.getAt(index);
        }

        private addPlayers() {
            this.players = [];
            for (let i = 0; i < this.number_of_players; i++) {
                this.players.push(new BoardPlayer(this.colors[i]));
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
            this.infoPanel.setInfo(this.current_player, this.left_turn_cells);

            this.updateActiveRegion();
            this.updatePossibleMoves();
        }

        private checkTurnChange() {
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

        private updatePossibleMoves() {
            this.possibleMoves = [];

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

        private checkPossibleMove(row: number, col: number) {
            let index = this.cellIndex(row, col);

            if (index >= 0 && index < this.board.children.length && this.possibleMoves.indexOf(index) == -1)
                if (this.isCellOccupiable(row, col)) {
                    this.possibleMoves.push(index);
                    //this.getCellByIndex(index).tint = 0xabcdef;
                }
        }
    }
}