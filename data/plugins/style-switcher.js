'use strict';

const fs = require('fsxt');

const { userDataRoot } = require('../../scriptycord/paths.js');

module.exports = {
  init() {
    fs.readdir(userDataRoot + '/highlight-js-themes', (err, files) => {
      if (err) {
        console.error(err);
        return;
      }
      
      window._styles = files.map(e => e.substring(0, e.lastIndexOf('.')));
      window._switchStyle = style => {
        fs.writeFileSync(userDataRoot + '/currentHighlightTheme.txt', style);
        // TODO
      };
      
      if (fs.existsSync(userDataRoot + '/currentHighlightTheme.txt')) {
        window._switchStyle(fs.readFileSync(userDataRoot + '/currentHighlightTheme.txt', 'utf8').trim());
      }
    });
  },

  name: 'Style Switcher',

  description: 'Highlight.js theme switcher',

  version: '1.0.0',

  author: 'hansen',
};