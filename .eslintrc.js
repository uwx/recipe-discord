'use strict';

const out = {
  globals: {
    Hansen: false,
    BDfunctionsDevilBro: true
  }
};

const fs = require('fs');
const root = require('os').homedir();

const cascade = [
  '/.eslintrc.js',
  '/.eslintrc.yaml',
  '/.eslintrc.yml',
  '/.eslintrc.json',
  '/.eslintrc',
];

let f;
for (let e of cascade) {
  f = root + e;
  if (fs.existsSync(f)) {
    out.extends = [ f ]; // cascading config! with SublimeLinter support
    break;
  }
}

module.exports = out;