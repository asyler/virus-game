/**
 * Created by asyler on 28.02.17.
 */

module UIPlugin {
    export let _game: Phaser.Game;
    export let objectFactory: ObjectFactory;

    class ObjectFactory {
        constructor(public game: Phaser.Game) {
        }

        data_group(parent?: any, name?: string, addToStage?: boolean, enableBody?: boolean, physicsBodyType?: number): UIPlugin.DataGroup {
            return new UIPlugin.DataGroup(_game, parent, name, addToStage, enableBody, physicsBodyType);
        }

        button(x: number, y: number, sprite: string, func, context, base_path, parent?, button_group?): UIPlugin.Button {
            return new UIPlugin.Button(_game, x, y, sprite, func, context, base_path, parent, button_group);
        }

        text_button(x:number, y:number, callback:(b?) => any, scope, text:string, font, parent?): UIPlugin.TextButton {
            return new UIPlugin.TextButton(_game, x, y, callback, scope, text, font, parent);
        }

        slider(x: number, y: number, key?: any, frame?: any, group?: Phaser.Group): UIPlugin.Slider {
            let slider = new UIPlugin.Slider(_game, x, y, key, frame);
            group.add(slider);
            return slider;
        }
    };

    export class Plugin {
        add: ObjectFactory;

        constructor(public game: Phaser.Game) {
            _game = game;
            this.add = new ObjectFactory(game);
            objectFactory = this.add;
        }
    }
}