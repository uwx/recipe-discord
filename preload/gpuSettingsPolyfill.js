'use strict';

exports.getEnableHardwareAcceleration = () => {
  return true; // TODO get setting from Franz...
};

exports.setEnableHardwareAcceleration = () => {
  console.log('tried to set harware acceleration, ignoring');
};