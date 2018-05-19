'use strict';

const electron = require('electron');
const fs = require('fsxt');

const { userDataRoot } = require('./paths.js');

exports.load = async () => {
  let storageData;
  try {
    const storageFile = await fs.readFile(userDataRoot + '/storage.json', 'utf8');
    if (!storageFile) {
      console.log('[scriptycord/storage] file is empty!');
      storageData = {};
    } else {
      storageData = JSON.parse(storageFile);
    }
  } catch (e) {
    console.error('[scriptycord/storage] during load: ', e);
    storageData = {};
  }
  
  function save() {
    fs.writeFileSync(userDataRoot + '/storage.json', JSON.stringify(storageData));
  }

  window.addEventListener('unload', save);
  process.on('exit', save);
  electron.remote.app.on('before-quit', save);

  return storageData;
};