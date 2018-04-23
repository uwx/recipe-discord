'use strict';

const electron = require('electron');
const fs = require('fsxt');

const { userDataRoot } = require('./paths.js');

exports.load = async () => {
  const storageData = JSON.parse(await fs.readFile(userDataRoot + '/storage.json', 'utf8'));
  
  function save() {
    fs.writeFileSync(userDataRoot + '/storage.json', JSON.stringify(storageData));
  }

  window.addEventListener('unload', save);
  process.on('exit', save);
  electron.remote.app.on('before-quit', save);

  return storageData;
};