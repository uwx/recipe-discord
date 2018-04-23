'use strict';

const fs = require('fsxt');
const proc = require('mz/child_process');

const { hansenExecute } = require('../utils/helpers.js');
const { userDataRoot, protocolRoot, localStorageRoot } = require('../paths.js');

const hansenTokenReadyCallbacks = [];
let hansenToken = null;

/**
 * add your callback to here, will be called with token when it's available
 * @param  {Function<string>} func callback to call with token argument
 */
exports.addTokenReadyCallback = func => {
  if (hansenToken) {
    func(hansenToken);
  } else {
    hansenTokenReadyCallbacks.push(func);
  }
};

hansenExecute(async () => {
  if (await fs.exists(userDataRoot + '/token.txt')) {
    hansenToken = await fs.readFile(userDataRoot + '/token.txt', 'utf8');
    console.log('[second][TokenFetcher] got it from token.txt!', hansenToken);
  } else if (window.localStorage && window.localStorage.token) {
    hansenToken = window.localStorage.token.slice(1,-1);
    console.log('[second][TokenFetcher] got it from localStorage!', hansenToken);
  } else if (window._localStorage && window._localStorage.token) {
    hansenToken = window._localStorage.token.slice(1,-1);
    console.log('[second][TokenFetcher] got it from _localStorage!', hansenToken);
  } else {
    // read token from sqlite and make it available, call callbacks
    let e = await proc.execFile(protocolRoot + '/sqlite3.exe', [localStorageRoot + '/https_canary.discordapp.com_0.localstorage', 'select hex(value) from ItemTable where key = "token";']);
    if (e[0]) e = e[0];

    const out = [];
    for (var i = 0; i < e.length; i += 4) {
      out.push(String.fromCharCode(parseInt(e.substr(i, 2), 16)));
    }
    hansenToken = out.join('').trim().slice(1, -2);
    console.log('[second][TokenFetcher] got it!', hansenToken);
  }
  hansenTokenReadyCallbacks.forEach(e => e(hansenToken));
  hansenTokenReadyCallbacks.length = 0;
  
  await fs.writeFile(userDataRoot + '/token.txt', hansenToken).catch(e => console.error('[second.js] failed to write token ' + e));
});