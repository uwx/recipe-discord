// render process: main window

'use strict';
module.exports = Franz => class Discord extends Franz {
  overrideUserAgent() {
    return 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) discord/0.0.204 Chrome/56.0.2924.87 Discord Canary/1.6.15 Safari/537.36';
  }
};

const win = require('electron').remote.getCurrentWindow();
win.on('unmaximize', () => {
  setTimeout(() => win.maximize(), 0);
});