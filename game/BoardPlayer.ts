module VirusGame {
    export class BoardPlayer {

        is_first_turn: boolean = true;
        is_local_player: boolean;

        constructor(public id:number, public color: string) {
            this.is_local_player = id === client.user_id;
        }
    }
} 