'use strict';

const electron = require('electron');
const app = electron.app;  // Module to control application life.
const Menu = electron.Menu; // Module to create native menus that can be used as application menus and context menus.
const Tray = electron.Tray; // Module to provide control over operating system's notification area.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const globalShortcut = electron.globalShortcut; // Module to register global keyboard shortcuts.
const ipc = electron.ipcMain; // Module to handle asynchronous and synchronous messages sent from a renderer process.
const path = require('path'); // Provide system path utilities.

let mainWindow;
let trayIcon;

// This method will allow load external screensaver packages.
function loadPackage() {
  // ..
}

// This method toggles the mainWindow state and loads the screensaver.
function toggleWindow() {
  // Load the screensaver
  mainWindow.loadURL('package://default');

  // and set the window visible.
  if(mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.setFullScreen(true);
    mainWindow.show();
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  app.quit();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  const electronProtocol = electron.protocol;
  const electronScreen = electron.screen;

  // Register package:// protocol.
  electronProtocol.registerFileProtocol('package', function(request, callback) {
    let relativePath = path.normalize(request.url.substr(10));
    let packagePath = null;

    if (process.argv.indexOf('--dev') !== -1) {
      packagePath = path.join(__dirname, 'packages', relativePath, 'index.html');
    } else {
      packagePath = path.join(__dirname, '..', 'packages', relativePath, 'index.html');
    }
    
    callback(packagePath);
  }, function(error) {
    if (error)
      console.error('Failed to register protocol');
  });

  // Save screen size.
  let windowSize = electronScreen.getPrimaryDisplay().size;

  // Create notification area app.
  trayIcon = new Tray(path.join(__dirname, 'resources', 'app.ico'));
  trayIcon.setToolTip(app.getName());
  trayIcon.setContextMenu(Menu.buildFromTemplate([
    { label: 'Load a package...', click: () => loadPackage() },
    { type: 'separator' },
    { label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'close', click: () => app.quit() }
  ]));

  // Create the screensaver window.
  mainWindow = new BrowserWindow({
    minWidth: windowSize.width,
    minHeight: windowSize.height,
    frame: false,
    show: false,
    webPreferences: {
      nodeIntegration: false
    }
  });

  // Bind mouse events.


  // Expose DevTools on dev mode.
  if (process.argv.indexOf('--dev') !== -1) {
    globalShortcut.register('ctrl+shift+j', function() {
      mainWindow.webContents.openDevTools();
    });
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  // Emitted when the trayIcon is clicked.
  trayIcon.on('click', function() {
    toggleWindow();
  });
});