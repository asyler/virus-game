Login = {
  before: function(browser){
    browser.resizeWindow(1800, 800);
  },

  'Phaser Game Boots Test' : function (client) {
    var main = client.page.main();
      main.navigate()
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
      .setLoginPassword('vlad','vlad')
      .waitForState('MainMenu', 3000);
  }
};
