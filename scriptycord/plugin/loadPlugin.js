'use strict';

const fs = require('fsxt');

const { firstLine } = require('../utils/string.js');
const { addHook, addStyle, addScript, isLightTheme } = require('../utils/domutils.js');

// on page load (#friends visible)
const loadedHooks = exports.loadedHooks = [];
// on any message element added (arg1 is element: .message-text)
const onMessageTextLoadedHandlers = exports.onMessageTextLoadedHandlers = [];
// on any message group added (arg1 is element: .message-group)
const onMessageGroupLoadedHandlers = exports.onMessageGroupLoadedHandlers = [];
// last added CSS hook num
let lastHookId = 0;

exports.loadFile = async (fileName, scriptPath) => {
  const fileNameNoExt = fileName.slice(0, fileName.lastIndexOf('.js'));
  
  // can't make these globals because of async logic
  const log = (...args) => {
    console.log(`[loadPlugin:${fileNameNoExt}]`, ...args);
  };
  const error = (...args) => {
    console.error(`[loadPlugin:${fileNameNoExt}]`, ...args);
  };
  const pluginLog = (...whew) => {
    console.log(`[Plugin][${fileName}]`, ...whew);
  };
  const pluginError = (...whew) => {
    console.error(`[Plugin][${fileName}]`, ...whew);
  };
  
  if (!fileName.endsWith('.js')) {
    console.warn('[loadPlugin] non-js file', fileName, 'found, ignoring');
    return;
  }
  
  // don't reuse the scope variable, or else log gets overwritten
  const scope = {
    addHook,
    addStyle,
    addScript,
    isLightTheme,
    //
    alog: log,
    aerror: error,
    log: pluginLog,
    error: pluginError,
  };
  
  log('evaluating plugin');
  try {
    const scriptText = await fs.readFile(scriptPath, 'utf8');
    const metaBlock = firstLine(scriptText);
    // BD declaration.. seems to be the only way to get the name of the plugin class
    if (metaBlock.startsWith('//META')) {
      evalBdPlugin(scope, scriptText, fileName, metaBlock);
    } else {
      evalRegularPlugin(scope, scriptPath, fileName, fileNameNoExt);
    }
  } catch(ex) {
    error('eval uncaught', ex);
  }
};


function evalRegularPlugin(scope, path, fileName, fileNameNoExt) {
  const { alog } = scope;

  let prettyPluginName = `scriptycord plugin: ${fileNameNoExt} (${fileName})`;

  alog('evaling non-BD plugin');
  const plugin = require(path);
  alog('eval succeeded!');

  // refresh with real name
  if (plugin.name) prettyPluginName = `scriptycord plugin: ${plugin.name} (${fileName})`;

  if (plugin.init) {
    alog('init');
    plugin.init.displayName = `[${prettyPluginName}].init()`;
    plugin.init(scope);
  }
  if (plugin.start) {
    plugin.start.displayName = `[${prettyPluginName}].start()`;
    loadedHooks.push(() => {
      alog('start');
      plugin.start();
    });
  }
  // add hooks
  if (plugin.hooks) {
    plugin.hooks.forEach(hook => {
      var id = `in-${fileNameNoExt}-hook-${++lastHookId}`;
      addHook(hook[0], id, hook[1], prettyPluginName);
      alog('hooked element listener:', hook[0], id, hook[1]);
    });
  }
  // add handlers
  if (plugin.onMessageTextLoaded) {
    alog('adding onMessageTextLoaded handler', plugin.onMessageTextLoaded);
    plugin.onMessageTextLoaded.displayName = `[${prettyPluginName}].onMessageTextLoaded()`;
    onMessageTextLoadedHandlers.push(plugin.onMessageTextLoaded);
  }
  if (plugin.onMessageGroupLoaded) {
    alog('adding onMessageGroupLoaded handler', plugin.onMessageGroupLoaded);
    plugin.onMessageGroupLoaded.displayName = `[${prettyPluginName}].onMessageGroupLoaded()`;
    onMessageGroupLoadedHandlers.push(plugin.onMessageGroupLoaded);
  }
  // inject css
  if (plugin.css) {
    alog('injecting stylesheet');
    addStyle(plugin.css);
  }
  // display info
  if (plugin.author && plugin.name && plugin.description && plugin.version) {
    alog(`[${plugin.version}] ${plugin.name} by ${plugin.author}\n"${plugin.description}"`);
  } else {
    alog('finished with success');
  }
}

function evalBdPlugin(scope, scriptText, fileName, metaText) {
  const { alog } = scope;

  alog('loading BD plugin [metadata: ' + metaText + ']');
  const meta = JSON.parse(metaText.slice('//META'.length, metaText.lastIndexOf('*//')));
  window.BdApi._entries.push(meta);

  const prettyPluginName = `scriptycord plugin: ${meta.name} (${fileName})`;

  window.bdplugins[meta.name] = meta;
  window.pluginCookie[meta.name] = true;

  // injection: semicolon to end statement, empty comment to stop broken comment.
  const pluginInjected = scriptText + ';/**/\n\nscope._bdApiInjected = ' + meta.name + ';';
  alog('plugin metadata', meta);
  
  alog('evaling BD plugin');
  
  if (!injectPlugin(pluginInjected, scope, prettyPluginName)) {
    return; // injection failed, exit
  }
  
  meta._pluginHolder_constructor = scope._bdApiInjected;
  alog('eval succeeded, building');
  const pl = meta._pluginHolder = new scope._bdApiInjected();
  if (pl.load) {
    alog('built, loading');
    pl.load.displayName = `[${prettyPluginName}].load()`;
    pl.load();
  }
  if (pl.start) {
    pl.start.displayName = `[${prettyPluginName}].start()`;
    loadedHooks.push(() => {
      alog('starting');
      pl.start();
    });
  }
  
  alog(`[${pl.getVersion()}] ${pl.getName()} by ${pl.getAuthor()}\n"${pl.getDescription()}"`);
}

function injectPlugin(scriptText, scope, pureName) {
  const { aerror } = scope;

  const failed = addScript(
    `window[${JSON.stringify(pureName)}] = function(scope, require) {
      ${scriptText}
    }`);
  
  if (failed) {
    aerror('eval failed with', failed);
    delete window[pureName];
    return false;
  }
  
  try {
    window[pureName](scope, window.Hansen.require);
  } catch (ex) {
    aerror('ainit failed', ex);
    delete window[pureName];
    return false;
  }

  delete window[pureName];
  return true;
}
