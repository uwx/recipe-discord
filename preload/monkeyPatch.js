'use strict';

const electron = require('electron');
const remElectron = electron.remote;

const monkeyGlobals = require('./monkeyGlobals.js');

// monkeypatch getGlobal
const oldGetGlobal = remElectron.getGlobal.bind(remElectron);
remElectron.getGlobal = v => {
  if (monkeyGlobals[v]) return monkeyGlobals[v];

  console.error('lookign for variable: ', v);
  return oldGetGlobal(v);
};

// monkeypatch electron.remote.require (only used once in preload but more elsewhere)
const oldRequire = remElectron.require.bind(remElectron);
remElectron.require = (...args) => {
  if (args[0] == './GPUSettings') return require('./gpuSettingsPolyfill.js');

  console.error('lookign for req: ', ...args);
  return oldRequire(...args);
};

/*

  var GPUSettings = require('./GPUSettings');
  bootstrapModules.GPUSettings.replace(GPUSettings);

*/