/// <reference path="../tsDefinitions/phaser-input.d.ts" />

module VirusGame {

    export class Login extends Phaser.State {
        ui: UIPlugin.Plugin;
        private loginInput;
        private passInput;

        preload() {
            this.load.atlasXML('ui', 'assets/ui.png', 'assets/ui.xml');
            this.ui = new UIPlugin.Plugin(this.game);
            this.game.add.plugin(PhaserInput.Plugin as any,[]);

            let state_manager = <StateManager>game.state;
            state_manager.history = [];
            game.state.onStateChange.add(function (newState, oldState) {
                if (!state_manager.returning) {
                    let s = [newState];
                    if (game.state.getCurrentState()['__data'])
                        s.push(game.state.getCurrentState()['__data']);
                    this.history.push(s);
                }
                else
                    state_manager.returning = false;
            }, game.state);
            state_manager.back = function () {
                state_manager.history.pop();
                let last_state = state_manager.history[state_manager.history.length-1];
                state_manager.returning = true;
                game.state.start(last_state[0], true, false, last_state.length>0 ? last_state[1] : null);
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
            this.loginInput.alignIn(this.game.world.bounds,Phaser.TOP_CENTER, 0, -215);

            this.passInput = this.game.add.inputField(0, 0, {
                width: 200,
                padding: 8,
                borderWidth: 1,
                borderColor: '#000',
                borderRadius: 6,
                placeHolder: 'password',
                type: PhaserInput.InputType.password
            });
            this.passInput.alignIn(this.game.world.bounds,Phaser.TOP_CENTER, 0, -250);
            this.passInput.onEnterCallback = [function () {
                this.passInput.endFocus();
                this.login();
            }, this];

            let gr = game.add.group();
            this.ui.add.text_button(0, 315, this.login, this, R.strings['login'], R.fonts['white_1'],gr)
                .alignTo(this.passInput, Phaser.BOTTOM_CENTER, 8, 10);
            this.ui.add.text_button(0, 370, this.register, this, R.strings['register'], R.fonts['white_1'],gr)
                .alignTo(this.passInput, Phaser.BOTTOM_CENTER, 8, 60);
        }

        login() {
            let login = this.loginInput.value;
            let password = this.passInput.value;
            client.login(login, password);
        }

        register() {
            let login = this.loginInput.value;
            let password = this.passInput.value;
            client.register(login, password);
        }

    }

}