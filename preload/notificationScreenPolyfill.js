'use strict';

const { remote: { ipcMain, getCurrentWebContents} } = require('electron');

const webContents = getCurrentWebContents();
//var _events = require('events');

// ipcMain events
var IPC_NOTIFICATIONS_CLEAR = 'NOTIFICATIONS_CLEAR';
var IPC_NOTIFICATION_SHOW = 'NOTIFICATION_SHOW';
var IPC_NOTIFICATION_CLICK = 'NOTIFICATION_CLICK';
var IPC_NOTIFICATION_CLOSE = 'NOTIFICATION_CLOSE';

// events
//var events = exports.events = new _events.EventEmitter();
//var NOTIFICATION_CLICK = exports.NOTIFICATION_CLICK = 'notification-click';

ipcMain.on(IPC_NOTIFICATIONS_CLEAR, logNotif(IPC_NOTIFICATIONS_CLEAR));
ipcMain.on(IPC_NOTIFICATION_SHOW, handleNotificationShow);
ipcMain.on(IPC_NOTIFICATION_CLICK, logNotif(IPC_NOTIFICATION_CLICK));
ipcMain.on(IPC_NOTIFICATION_CLOSE, logNotif(IPC_NOTIFICATION_CLOSE));

function handleNotificationShow(e, notification) {
  console.log('[notificationScreenPolyfill]', notification);
  // sound handling not necessary
  /*{ body: 'Im a goo guy',
      icon: 'https://cdn.discordapp.com/avatars/152810994933039104/eeb3540732b588eebd18eb52445a5f4a.png?size=256',
      id: 0,
      title: 'Ged (#general, General Talk)' }*/

  const icon = notification.icon.startsWith('http') ? notification.icon : ('http://canary.discordapp.com' + notification.icon);

  const notif = new Notification(notification.title, {
    body: notification.body,
    icon
  });
  notif.onclick = () => {
    console.log('sending notif click:', notif);
    webContents.send(IPC_NOTIFICATION_CLICK, notification.id);
  };
}
function logNotif(type) {
  return (a, b) => console.log('[notificationScreenPolyfill:' + type + '] log notif', a, b);
}

/*
Clean up ipcMain listeners since they are not destroyed when refreshing

Attempting to call a function in a renderer window that has been closed or released.
Function provided here: Object.<anonymous> (C:\Users\Rafael\AppData\Roaming\Franz\recipes\dev\recipe-discord\preload\notificationScreenPolyfill.js:21:9
 */
window.addEventListener('unload', () => {
  //alert('unloading!');
  ipcMain.removeAllListeners(IPC_NOTIFICATIONS_CLEAR);
  ipcMain.removeAllListeners(IPC_NOTIFICATION_SHOW);
  ipcMain.removeAllListeners(IPC_NOTIFICATION_CLICK);
  ipcMain.removeAllListeners(IPC_NOTIFICATION_CLOSE);
});