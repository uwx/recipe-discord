'use strict';

const path = require('path');

exports.recipeRoot = path.join(__dirname, '..');

// localstorage files
exports.localStorageRoot = path.resolve(process.env.appdata, 'discordcanary/Local Storage');

// hansen:// root
exports.protocolRoot = path.resolve(exports.recipeRoot, './data/protocol');

// injectedUserData (store your things in here)
exports.userDataRoot = path.resolve(exports.recipeRoot, './data/userData');

// BD data root
exports.bdRoot = path.resolve(process.env.appdata, 'BetterDiscord/');

// BD plugins folder
exports.bdPluginsRoot = path.resolve(process.env.appdata, 'BetterDiscord/plugins/');