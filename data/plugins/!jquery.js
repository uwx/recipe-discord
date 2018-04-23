'use strict';

const https = require('https');
const fs = require('fsxt');

const { userDataRoot } = require('../../scriptycord/paths.js');

function download(url, dest, cb) {
  const file = fs.createWriteStream(dest);
  https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
}

exports.init = scope => {
  const { log, error } = scope;
  if (fs.existsSync(userDataRoot + '/jQuery.js')) {
    log('loading jQuery');
    const module = {
      exports: {},
    };
    eval(fs.readFileSync(userDataRoot + '/jQuery.js', 'utf8'));
    if (!window.$ || !window.jQuery) {
      window.jQuery = window.$ =  module.exports;
    }
    log('done loading jQuery');
  } else {
    log('downloading jQuery');
    download('https://code.jquery.com/jquery-3.2.1.min.js', userDataRoot + '/jQuery.js', err => {
      if (err) {
        error('could not download jQuery', err);
      }
      log('done downloading jQuery');
      exports.init(scope);
    });
  }
};