module VirusGame {
    export class BoardGame extends Phaser.State {

        number_of_players: number = 2;
        current_player_number: number;
        left_turn_cells: number;
        activeCellsIndex: Array<number> = [];

        board: Phaser.Group;
        players: Array<BoardPlayer>;
        info: InfoPanel;

        colors: Array<string> = ['blue', 'yellow'];

        create() {
            this.addPlayers();
            this.initGame();
            this.drawBoard();
            this.drawInfo();
        }

        private drawInfo() {
            this.info = this.add.existing(new InfoPanel(this.game, this.world.centerX, 10));
            this.info.setInfo(this.current_player, this.left_turn_cells);
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

        private getCell(row: number, col: number): BoardCell {
            return <BoardCell>this.board.getAt(this.cellIndex(row, col));
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
            this.updateActiveRegion();
            this.info.setInfo(this.current_player, this.left_turn_cells);
        }

        private checkTurnChange() {
            if (this.left_turn_cells == 0) {
                if (this.current_player.is_first_turn)
                    this.current_player.is_first_turn = false;

                this.activeCellsIndex = [];

                this.current_player_number = (this.current_player_number + 1) % this.number_of_players;

                if (this.current_player.is_first_turn)
                    this.left_turn_cells = 1;
                else
                    this.left_turn_cells = 3;

            }
        }

        isTurnLegal(row: number, col: number): boolean {
            let cell = this.getCell(row, col);

            if (this.current_player.is_first_turn)
                if (cell.state == CellState.Empty)
                    return this.isTileOnEdge(row, col);
                else
                    return false;

            if (cell.state == CellState.Empty || cell.state == CellState.Alive && cell.player != this.current_player)
                if (this.isAnyNeighbourActive(row, col)) {
                    this.activeCellsIndex = [];
                    return true;
                }
                else
                    return false;
        }

        private isTileOnEdge(row: number, col: number): boolean {
            if (row == 0 || row == 9 || col == 0 || col == 9)
                return true;
            else
                return false;
        }

        private isAnyNeighbourActive(row: number, col: number): boolean {
            let index1 = this.cellIndex(row - 1, col);
            let index2 = this.cellIndex(row + 1, col);
            let index3 = this.cellIndex(row, col - 1);
            let index4 = this.cellIndex(row, col + 1);

            if (this.activeCellsIndex.indexOf(index1) != -1 ||
                this.activeCellsIndex.indexOf(index2) != -1 ||
                this.activeCellsIndex.indexOf(index3) != -1 ||
                this.activeCellsIndex.indexOf(index4) != -1)
                return true;
            else
                return false;
        }

        private updateActiveRegion() {
            for (let element of this.board.children) {
                let cell = <BoardCell>element;

                if (cell.state == CellState.Alive && cell.player == this.current_player) {
                    this.activeCellsIndex.push(this.cellIndex(cell.row, cell.col));
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

            if (index >= 0 && index < this.board.children.length && this.activeCellsIndex.indexOf(index) == -1) {
                let cell = this.getCell(row, col);
                if (cell.state == CellState.Dead && cell.player == this.current_player) {
                    this.activeCellsIndex.push(this.cellIndex(cell.row, cell.col));
                    this.activateNeighboursOf(row, col);
                }
            }
        }
    }
}