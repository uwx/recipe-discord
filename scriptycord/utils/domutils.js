'use strict';

const hooks = {};

function addHook(selector, id, callback, prettyCallbackName = 'scriptycord hook: ' + id) {
  addStyle(`
  @keyframes ${id} {  
    from {  
      outline-color: #fff; 
    }
    to {  
      outline-color: #000;
    }  
  }
  ${selector} {
    animation-duration: 0.01s;
    animation-name: ${id};
  }
  `);
  
  callback.displayName = `[${prettyCallbackName}]."${selector}"`;
  hooks[id] = callback;
}

document.addEventListener('animationstart', event => {
  const animName = event.animationName;
  const hook = hooks[animName];
  if (hook && hook(event.target)) {
    delete hooks[animName];
  }
}, true);

function addStyle(css) {
  const style = document.createElement('style');

  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));

  document.head.appendChild(style);
}

function addScript(code) {
  try {
    var h = document.createElement('script');
    h.appendChild(document.createTextNode(code));
    document.head.appendChild(h);
    return false;
  } catch (e) {
    return e;
  }
}

function isLightTheme() {
  return document.getElementsByClassName('theme-light').length > document.getElementsByClassName('theme-dark').length;
}

module.exports = { addHook, addStyle, addScript, isLightTheme };