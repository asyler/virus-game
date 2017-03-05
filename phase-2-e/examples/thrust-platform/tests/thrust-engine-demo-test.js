module.exports = {
  before: function(browser){
    browser.resizeWindow(1800, 600);
  },

  'Phaser Game Boots Test' : function (client) {
    var thrust = client.page.thrustPlatform();
    thrust.navigate()
      .waitForElementVisible('body', 1000)
  },

  'Phaser Game Loads Test': function (client) {
    client
      .waitForPhaser(5000)
      .waitForGame(5000)
      .waitForState('Login', 5000)
      .assert.currentState('Login');
  },

  'Login Test' : function (client) {
    client
      .waitForStateVar('loginInput', 3000)
      .setLoginPassword('test','test')
      .waitForState('MainMenu', 3000);
  },

  'Resume Game Test' : function (client) {
    client
        .callFunction('resumeGame')

  }

};
