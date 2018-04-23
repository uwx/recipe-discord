'use strict';
try {
  window.__sockets = [];
  class HackSocket extends WebSocket {
    constructor(...args) {
      super(...args);
      window.__sockets.push({
        t: this,
        args: args
      });
    }
  }
  window.WebSocket = HackSocket;
  console.log('[preload-script] prepared socket');

  //if (window.skap) document.removeEventListener('keydown', window.skap);
  window.__key_down_hooks = [];
  window.__key_press_hooks = [];
  document.addEventListener('keydown', e => {
    for (let hook of window.__key_down_hooks) {
      hook(e);
    }
  }, true);
  document.addEventListener('keypress', e => {
    for (let hook of window.__key_press_hooks) {
      hook(e);
    }
  }, true);
  
  console.log('[preload-script] prepared!');
} catch (err) {
  console.error('[preload-script] error on load', err);
}