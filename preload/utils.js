'use strict';

const electron = require('electron');
const remElectron = electron.remote;

const path = require('path');
const fs = require('fs');

/**
 * %APPDATA%
 * @type {string}
 */
exports.discordAppdataRoot = remElectron.app.getPath('appData');

/**
 * %LOCALAPPDATA%
 * @type {string}
 */
exports.discordLocalAppdataRoot = process.env.LOCALAPPDATA;

/**
 * %APPDATA%/discordcanary
 * @type {string}
 */
exports.userDataPath = path.join(exports.discordAppdataRoot, 'discordcanary');

/**
 * 0.0.XXX
 * @type {string}
 */
exports.appTitle = getAppTitle(exports.userDataPath);

/**
 * %LOCALAPPDATA%/DiscordCanary/app-0.0.XXX
 * @type {string}
 */
exports.localUserDataPath = path.join(exports.discordLocalAppdataRoot, 'DiscordCanary', 'app-' + exports.appTitle);

/**
 * Global 'mainAppDirname' value. Integrity of this must be mantained so only use path.join!
 * %APPDATA%/discordcanary/0.0.XXX/modules/discord_desktop_core/core.asar/app
 * @type {string}
 */
exports.desktopCoreAppRoot = path.join(exports.userDataPath, exports.appTitle, 'modules', 'discord_desktop_core', 'core.asar', 'app');

function getAppTitle(userDataPath) {
  return fs
    .readdirSync(userDataPath)
    .filter(e => e.includes('0.0.'))
    .sort((a, b) => {
      return parseInt(b.slice(b.lastIndexOf('.')+1)) - parseInt(a.slice(a.lastIndexOf('.')+1));
    })[0];
}

exports.nukeCrashReporter = () => {
  electron.crashReporter.start = () => {};
  console.log('[preload-script:utils] crashReporter state: ' + electron.crashReporter.start);
};
