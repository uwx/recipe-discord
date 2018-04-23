'use strict';

module.exports = {
  name: 'devtronLoader',

  description: 'Injects Devtron.',

  version: '1.0.0',

  author: 'hansen',
  
  init() {
    try {
      require('devtron').install();
      console.log('[devtronLoader] loaded');
    } catch (e) {
      console.error('[devtronLoader] failed with', e);
    }
  },
};