'use strict';

const featureFlags = module.exports = {
  flags: new Set(),
  getSupported() {
    return Array.from(featureFlags.flags);
  },
  supports(feature) {
    return featureFlags.flags.has(feature);
  },
  declareSupported(feature) {
    if (featureFlags.supports(feature)) {
      console.error('Feature redeclared; is this a duplicate flag? ', feature);
      return;
    }

    featureFlags.flags.add(feature);
  }
};

// TODO: remove on or after April 2018
featureFlags.declareSupported('new_app_badge');

// TODO remove on or after March 2018
featureFlags.declareSupported('app_configs');

/*
var FeatureFlags = function () {
  function FeatureFlags() {
    _classCallCheck(this, FeatureFlags);

    this.flags = new Set();
  }

  _createClass(FeatureFlags, [{
    key: 'getSupported',
    value: function getSupported() {
      return Array.from(this.flags);
    }
  }, {
    key: 'supports',
    value: function supports(feature) {
      return this.flags.has(feature);
    }
  }, {
    key: 'declareSupported',
    value: function declareSupported(feature) {
      if (this.supports(feature)) {
        console.error('Feature redeclared; is this a duplicate flag? ', feature);
        return;
      }

      this.flags.add(feature);
    }
  }]);

  return FeatureFlags;
}();
*/