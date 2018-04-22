'use strict';

const { desktopCoreAppRoot } = require('./utils.js');

module.exports = {
  releaseChannel: 'canary',
  mainAppDirname: desktopCoreAppRoot,
  appSettings: require('./appSettingsPolyfill.js'),
  features: require('./featureFlagsPolyfill.js')
};