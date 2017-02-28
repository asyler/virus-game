/**
 * Created by asyler on 28.02.17.
 */

module UIPlugin {
    class ObjectFactory {
        constructor(public game: Phaser.Game) {
        }

        button(x:number, y:number, callback:() => any, scope, text:string, font): UIPlugin.Button {
            return new UIPlugin.Button(this.game, x, y, callback, scope, text, font);
        }
    };

    export class Plugin {
        add: ObjectFactory;

        constructor(public game: Phaser.Game) {
            this.add = new ObjectFactory(game);
        }
    }
}