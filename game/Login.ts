/// <reference path="../tsDefinitions/phaser-input.d.ts" />

module VirusGame {

    export class Login extends Phaser.State {
        ui: UIPlugin.Plugin;
        private loginInput;
        private passInput;

        preload() {
            this.ui = new UIPlugin.Plugin(this.game);
            this.game.add.plugin(PhaserInput.Plugin as any,[]);
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

            this.ui.add.button(this.world.centerX+30, 320, this.login, this, R.strings['login'], R.fonts['white_1']);
        }

        login() {
            let login = this.loginInput.value;
            let password = this.passInput.value;
            client.login(login, password);
        }

    }

}