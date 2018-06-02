'use strict';

const { ipcRenderer, remote: { ipcMain } } = require('electron');

const { hansenExecute } = require('../utils/helpers.js');
const { recipeRoot } = require('../paths.js');

let uniqueId = 0;

hansenExecute(async () => {
  const fs = require('fsxt');
  const path = require('path');
  
  async function render(css, name) {
    try {
      const startTime = new Date().getTime();
      const result = await queueRender(css);
      const endTime = new Date().getTime();
      console.info('[cssInjection][render] rendered', name, 'in', endTime - startTime, 'ms');
      return result;
    } catch (e) {
      console.error('[cssInjection] failed with', e);
      return '';
    }
  }

  // queue a less compilation on the main process
  function queueRender(css) {
    return new Promise(resolve => {
      function callback(event, outCss, outId) {
        if (outId !== id) return;

        ipcRenderer.removeListener('HANSEN_LESS_COMPILE_REPLY', callback);
        resolve(outCss);
      }

      const id = 'scriptycord-' + (uniqueId++);

      ipcRenderer.on('HANSEN_LESS_COMPILE_REPLY', callback);
      ipcRenderer.send('HANSEN_LESS_COMPILE', css, id);
    });
  }

  async function applyAndWatchCSS(cssPath, name, ext, useLess = false) {
    let cssText = await fs.readFile(cssPath, 'utf-8');
    if (useLess) cssText = await render(cssText, name);
    
    const styleTag = document.createElement('style');
    styleTag.id = 'hansen-css-' + name + '-' + ext;
    const cssNode = document.createTextNode(cssText);
    styleTag.appendChild(cssNode);
    
    document.head.appendChild(styleTag);
    
    console.info('[cssInjection] loaded', name, '(' + ext + ')');
    
    fs.watch(cssPath, { encoding: 'utf-8' }, async eventType => {
      if (eventType != 'change') return;
      
      const changed = await fs.readFile(cssPath, 'utf-8'); // should this be sync?
      if (useLess) cssNode.nodeValue = await render(changed, name);
      else cssNode.nodeValue = changed;
      
      console.info('[cssInjection] refreshed', name, '(' + ext + ')');
    });
  }
  
  for (let file of await fs.readdir(recipeRoot + '/data/css')) {
    const cssPath = recipeRoot + '/data/css/' + file;
    const parsed = path.parse(cssPath);
    if (parsed.ext != '.css' && parsed.ext != '.less') continue;
    await applyAndWatchCSS(cssPath, parsed.name, parsed.ext.slice(1), parsed.ext == '.less');
  }
});