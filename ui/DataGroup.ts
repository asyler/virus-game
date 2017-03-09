/**
 * Created by asyler on 28.02.17.
 */

module UIPlugin {
    export class DataGroup extends Phaser.Group {
        public data:any;

        constructor(game_:Phaser.Game, parent:PIXI.DisplayObjectContainer, name:string, addToStage:boolean, enableBody:boolean, physicsBodyType:number) {
            super(game_, parent, name, addToStage, enableBody, physicsBodyType);
        }
    }
}