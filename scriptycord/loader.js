'use strict';

const fs = require('fsxt');
const log = require('debug')('hansen:Loader');

const { addHook } = require('./utils/domutils.js');

log('[zeroth] injecting globals');

// register the global window.Hansen
require('./globals.js');

const { recipeRoot, bdRoot, bdPluginsRoot } = require('./paths.js');

const { catchAsync } = require('./utils/helpers.js');

module.exports = async () => {
  log('async begin');

  await loadGlobals();
  const pluginLoader = require('./plugin/loadPlugin.js');

  let files = await catchAsync(fs.readdir(recipeRoot + '/data/plugins'), 'readdir failed with', []);
  log('found ' + files.length + ' plugin files');

  log('injecting normal mode plugins');
  for (let e of files) {
    await pluginLoader.loadFile(e, recipeRoot + '/data/plugins/' + e);
  }

  if (await bdFirstTimeWarning()) {
    log('injecting bd mode plugins');
    files = await catchAsync(fs.readdir(bdPluginsRoot), 'readdir-bd failed with', []);
    for (let e of files) {
      await pluginLoader.loadFile(e, bdPluginsRoot + '/' + e);
    }
  }

  // add hook for onload
  let loadedDone = false;
  addHook('#friends, .chat', '__allLoaded', el => {
    if (loadedDone) return;
    loadedDone = true;
    for (let plugin of pluginLoader.loadedHooks) {
      try {
        plugin.start(el);
      } catch(ex) {
        console.error(`[PluginLoader][LoadHooks:${plugin.name}] failed with`, ex);
      }
    }
  });
  
  addHook('.message-text', 'hansen-message-text-handler', e => pluginLoader.onMessageTextLoadedHandlers.forEach(f => f(e)));
  addHook('.message-group', 'hansen-message-group-handler', e => pluginLoader.onMessageGroupLoadedHandlers.forEach(f => f(e)));

  handleDeinit(pluginLoader);

  log('async end');
};

function handleDeinit(plugins) {
  let disposed = false;
  window.addEventListener('unload', () => {
    if (disposed) return;
    disposed = true;
    for (let hook of plugins.deinitHooks) {
      const returned = hook();
      if (returned instanceof Promise) {
        console.error('[loader:deinit:tidySync] cannot handle promise @' + hook.displayName);
      }
    }
  });
  
  const { ipcRenderer, remote: { ipcMain } } = require('electron');
  ipcMain.on('HANSEN_WEVIEW_START_TIDY', async () => {
    // no need to check if(disposed) here, this will always run before onunload
    disposed = true;

    const dlog = require('debug')('hansen:Loader:Deinit');
    dlog('received signal from Franz to begin cleanup...');
    try {
      for (let hook of plugins.deinitHooks) {
        const returned = hook();
        if (returned instanceof Promise) {
          await returned;
        }
      }
      ipcRenderer.send('HANSEN_WEVIEW_TIDY_FINISHED', true); // true: success
    } catch (e) {
      console.error('[loader:deinit:tidy]', e);
      ipcRenderer.send('HANSEN_WEVIEW_TIDY_FINISHED', false); // false: not success
    }
    dlog('cleanup finished, talked back to Franz, this message should not appear maybe?');
  });
}

async function loadGlobals() {
  // storage.json
  const storageData = await require('./storage.js').load();

  // BdApi and bdPluginStorage
  require('./bdPolyfills').load(storageData);

  // scriptycord settings menu
  await require('./pluginSettings.js').load();
}

/**
 * warns the user on first time if the bd plugin folder exists
 * @return {string} true if the plugins folder exists, false otherwise
 */
async function bdFirstTimeWarning() {
  if (await fs.exists(bdPluginsRoot)) {
    if (!(await fs.exists(bdRoot + '/seen.me'))) {
      alert('a BetterDiscord plugins folder was found. plugins can now be laoded from there, so you might have conflicts or incompatibilities.');
      await fs.writeFile(bdRoot + '/seen.me', 'check');
    }
    return true;
  }
  return false;
}