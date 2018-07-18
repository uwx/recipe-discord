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
/*
function getReactInstance(node) {
  return node[Object.keys(node).find((key) => key.startsWith('__reactInternalInstance'))];
};
window.__key_down_hooks[0] = e => {
  const txta = document.getElementsByTagName('textarea')[0];
  const kcode = String.fromCharCode(e.char || e.charCode || e.keyCode || e.which);
  const value = txta.value + kcode;
  if (value.startsWith('/beep') && e.which == 13) {
    console.log('got it!', e);
    const ri = getReactInstance(txta);
    const ri2 = ri.return.memoizedProps;
    txta.value = ri2.value = ri.memoizedProps.value = 'boop';
    e.preventDefault();
    ri.memoizedProps.onChange({target: txta});
    ri.memoizedProps.onKeyPress({which: 13,preventDefault: (...args) => console.log(...args, new Error())});
  }
};
  */
  
  /*new version:
var handler = {
    get: function(obj, prop) {
        return prop in obj ?
            obj[prop] :
            console.log('tried', obj, prop);
    }
};

var rtxt = DiscordInternals.getInternalInstance($0); // <textarea> element
var txtel = $0;

var p = new Proxy({which: 13,preventDefault: (...args) => console.log(...args, new Error())}, handler);
var onc = new Proxy({target: txtel, currentTarget: txtel}, handler);

$0.value = rtxt.return.memoizedProps.value = rtxt.memoizedProps.value = 'foosbar44';
rtxt.memoizedProps.onBlur();
rtxt.memoizedProps.onChange(onc);
rtxt.memoizedProps.onKeyPress(p);
*/