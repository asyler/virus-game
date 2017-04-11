module VirusGame {
    export class BoardPlayer {

        is_first_turn: boolean = true;
        is_local_player: boolean;

        constructor(public id:number, public color: string, public state: number, public is_alive: boolean) {
            this.is_local_player = id === client.user_id;
        }
    }
} 