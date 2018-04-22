'use strict';

const { userDataPath } = require('./utils.js');
const path = require('path');
const fs = require('fs');

const appSettings = module.exports = {
  _lastModified() {
    try {
      return fs.statSync(appSettings.path).mtime.getTime();
    } catch (e) {
      return 0;
    }
  },
  get: (key, defaultValue) => {
    defaultValue = !!defaultValue;

    if (appSettings.settings.hasOwnProperty(key)) {
      return appSettings.settings[key];
    }

    return defaultValue;
  },
  set: (key, value) => {
    appSettings.settings[key] = value;
  },
  save() {
    if (appSettings.lastModified && appSettings.lastModified !== appSettings._lastModified()) {
      console.warn('Not saving settings, it has been externally modified.');
      return;
    }

    try {
      var toSave = JSON.stringify(appSettings.settings, null, 2);
      if (appSettings.lastSaved != toSave) {
        appSettings.lastSaved = toSave;
        fs.writeFileSync(appSettings.path, toSave);
        appSettings.lastModified = appSettings._lastModified();
      }
    } catch (err) {
      console.warn('Failed saving settings with error: ', err);
    }
  }
};

appSettings.path = path.join(userDataPath, 'settings.json');
try {
  appSettings.lastSaved = fs.readFileSync(appSettings.path);
  appSettings.settings = JSON.parse(appSettings.lastSaved);
} catch (e) {
  appSettings.lastSaved = '';
  appSettings.settings = {};
}
appSettings.lastModified = appSettings._lastModified();


// root = userDataPath
/*
var Settings = function () {
  function Settings(root) {
    this.path = path.join(root, 'settings.json');
    try {
      this.lastSaved = _fs2.default.readFileSync(this.path);
      this.settings = JSON.parse(this.lastSaved);
    } catch (e) {
      this.lastSaved = '';
      this.settings = {};
    }
    this.lastModified = this._lastModified();
  }

  _createClass(Settings, [{
    key: '_lastModified',
    value: function _lastModified() {
      try {
        return _fs2.default.statSync(this.path).mtime.getTime();
      } catch (e) {
        return 0;
      }
    }
  }, {
    key: 'get',
    value: function get(key) {
      var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (this.settings.hasOwnProperty(key)) {
        return this.settings[key];
      }

      return defaultValue;
    }
  }, {
    key: 'set',
    value: function set(key, value) {
      this.settings[key] = value;
    }
  }, {
    key: 'save',
    value: function save() {
      if (this.lastModified && this.lastModified !== this._lastModified()) {
        console.warn('Not saving settings, it has been externally modified.');
        return;
      }

      try {
        var toSave = JSON.stringify(this.settings, null, 2);
        if (this.lastSaved != toSave) {
          this.lastSaved = toSave;
          _fs2.default.writeFileSync(this.path, toSave);
          this.lastModified = this._lastModified();
        }
      } catch (err) {
        console.warn('Failed saving settings with error: ', err);
      }
    }
  }]);

  return Settings;
}();
*/