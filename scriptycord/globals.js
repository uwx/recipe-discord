'use strict';

const path = require('path');

window.Hansen = {
  // require a file relative to DiscordCanary\injectedNodeModules\node_modules
  require(mod) { // don't deprecate
    return require(mod);
  },
  // require a file relative to DiscordCanary\injected
  rlocal(find) {
    throw new Error('rlocal has been deprecated: ' + find);
  },
  path,
  mzfs: require('fsxt'),
};

global.__require = find => {
  throw new Error('__require has been deprecated: ' + find);
};
