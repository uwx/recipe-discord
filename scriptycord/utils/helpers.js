'use strict';

const log = require('debug')('hansen:helpers');

exports.catchAsync = async (promise, errorMessage, def) => {
  try {
    return await promise;
  } catch (e) {
    console.error('[helpers]catchAsync error', errorMessage, e);
    return def;
  }
};

exports.hansenExecute = func => {
  const fn = func.name || '<unnamed function>';
  log('hansenExecute executing ' + fn);
  
  const result = func();
  if (result instanceof Promise) {
    result.then((...args) => {
      log('hansenExecute[' + fn + '] finished successfully;' + args.join(' '));
    }).catch((...errors) => {
      console.error('hansenExecute[' + fn + '] failed');
      
      console.error('hansenExecute[' + fn + '] error results', ...errors.filter(e => {
        if (e instanceof Error) {
          console.error(e);
          return false;
        }
        return true;
      }));
    });
  } else {
    log('hansenExecute[' + fn + '] finished' + (result || '<no result>'));
  }
};
