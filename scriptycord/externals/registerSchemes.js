'use strict';
const electron = require('electron');
const path = require('path');

const { protocolRoot } = require('../paths.js');

module.exports = (async () => {
  await eventAsyncOnce(process, 'loaded');

  const webContents = electron.remote.getCurrentWebContents();
  // need to be in dom-ready for isProtocolHandled to work (i think?)
  await eventAsyncOnce(webContents, 'dom-ready');

  const protocol = webContents.session.protocol;
  const isHandled = isProtocolHandled(protocol, 'hansen');

  console.log('[got callback');
  if (isHandled) {
    console.warn('[registerSchemes] hansen already handled, removing');
    await unregisterProtocol(protocol, 'hansen');
  }

  protocol.registerFileProtocol('hansen', (req, callback) => {
    var url = req.url.substr(9);
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    
    console.log('[HANSEN] url', url);
    callback({path: path.normalize(protocolRoot + '/' + url)});
  }, error => {
    if (error) {
      console.error('[HANSEN] Failed to register protocol', error);
    }
  });

  // i havent determined whether this needs to be up here, or it needs to be present at all
  electron.webFrame.registerURLSchemeAsPrivileged('hansen');
  electron.webFrame.registerURLSchemeAsPrivileged('extension');
  electron.webFrame.registerURLSchemeAsPrivileged('chrome-extension');
})();

function eventAsyncOnce(obj, ev) {
  return new Promise(resolve => {
    obj.once(ev, resolve);
  });
}

function isProtocolHandled(protocol, name) {
  return new Promise(resolve => {
    protocol.isProtocolHandled(name, resolve);
  });
}

function unregisterProtocol(protocol, scheme) {
  return new Promise((resolve, reject) => {
    protocol.unregisterProtocol(scheme, err => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/*
webFrame.registerURLSchemeAsPrivileged(scheme[, options])

    scheme String
    options Object (optional)
        secure Boolean - (optional) Default true.
        bypassCSP Boolean - (optional) Default true.
        allowServiceWorkers Boolean - (optional) Default true.
        supportFetchAPI Boolean - (optional) Default true.
        corsEnabled Boolean - (optional) Default true.

*/