'use strict';

const fs = require('fsxt');

const { addStyle, addScript } = require('./utils/domutils.js');
const { userDataRoot } = require('./paths.js');
const { BdApi } = require('./bdPolyfills.js');

exports.load = async () => {
  // inject sweetalert
  addScript(await fs.readFile(userDataRoot + '/sweetalert2.js', 'utf8'));
  // sweetalert text color improvement
  addStyle(`
  .swal2-container * {
    color: #eee !important;
  }`);

  // settings dialog (individual plugin)
  function pluginSettings({name, plugin}) {
    window.swal({
      title: 'Plugin Settings: ' + name, 
      background: '#36393f',
      allowOutsideClick: false,
      html: '<div id="settingsPanel___ReplaceMe"></div>', 
      width: '85%',
      onBeforeOpen: () => {
        $('#settingsPanel___ReplaceMe').html(plugin.getSettingsPanel());
      },
      confirmButtonText: 'Close',
    }).then(r => {
      const success = !!r.value || r.dismiss == 'overlay';
      console.log('sweetalert individual plugin:', r, success);
      
      // go back to previous page. yes this is a bad use of the stack.
      openSettingsDialog();
    });
  }

  // settings dialog (showing all the plugins)
  function openSettingsDialog() {
    const str = [];
    const exts = [];
    let id = 0;
    
    BdApi._entries.forEach(e => {
      const p = e._pluginHolder;
      if (!p.getSettingsPanel) return;
      
      const name = p.getName();
      const author = p.getAuthor();
      const version = p.getVersion();
      const description = p.getDescription();
      
      const aid = '__hansen_settingHolder_' + (id++);
      exts.push({name, id: aid, plugin: p});
      str.push(`
        <li id="${aid}" style="
          clear: both;
          text-align: left;
          border: 1px black solid;
          border-radius: 2px;
          padding: 5px;
          display: table;
          width: 100%;
          cursor: pointer;"
        ><p style="
          display: inline-block;
          float: left;">${name}<br><span style="
            color: gray;
            font-style: italic;">${description}</span> - <b>${version}</b></p>
        <p style="
          text-align: right;
          display: inline-block;
          float: right;">${author}<br><span style="
            color: gray;
            font-size: 80%;">${description}<span></p></li>`);
      //
    });
    
    window.swal({
      title: 'Plugin Settings', 
      background: '#36393f',
      allowOutsideClick: false,
      html: `<ul>${str.join('')}</ul>`, 
      width: '85%', 
      /*grow: 'column',*/ 
      //showCancelButton: true,
      confirmButtonText: 'Close',
      onBeforeOpen: (/*dom*/) => {
        exts.forEach(ext => {
          document.getElementById(ext.id).addEventListener('click', () => {
            pluginSettings(ext);
          });
        });
      }
    }).then(r => {
      const success = !!r.value || r.dismiss == 'overlay';
      console.log('sweetalert all plugins:', r, success);
    });
  }

  // TODO: settings button
  //electron.ipcRenderer.on('HANSEN_POP_SETTINGS', openSettingsDialog);
};