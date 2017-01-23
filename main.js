'use strict';

const {BrowserWindow, Tray, Menu, MenuItem, app, ipcMain} = require('electron')
  , path = require('path')
  , url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
  , tray
  , track_info
  , menu;

/**
 * Create context menu with Quit.
 * 
 * @return void
 */
function createMenu() {
  menu = new Menu();
  menu.append(new MenuItem({ label: 'Quit', type: 'normal', role: 'quit' }));
}

/**
 * Instantiate an instance of BrowserWindow
 * 
 * @return void
 */
function createWindow () {
  const window_options = {
      width: 460
    , height: 250
    , frame: false
    , show: false
    , backgroundColor: (process.platform !== "darwin") ? "#333333" : undefined
    , movable: false
    , minimizable:false
    , maximizable:false
    , fullscreenable: false
    , vibrancy: "ultra-dark"
  };
  // Create the browser window.
  mainWindow = new BrowserWindow(window_options);

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html')
    , protocol: 'file:'
    , slashes: true
  }));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}
/**
 * Creates the tray with an icon and the hidden browser window
 * Also sets up the toggling of the browser window by the tray icon.
 * 
 * @return void
 */
function createTray () {
  tray = new Tray("assets/images/spotify.png");

  createWindow();

  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });

  mainWindow.on('show', () => {
    tray.setHighlightMode('always');
  });

  mainWindow.on('hide', () => {
    tray.setHighlightMode('never');
  });
}

process.platform === "darwin" && app.dock.hide();

// Listeners
// The app listens on these events in order to trigger their functionality

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createTray);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Create the context menu
app.on('browser-window-created', (event, win) => {
  win.webContents.on('context-menu', (e, params) => {
    menu.popup(win, params.x, params.y);
  });
});

// Listener to update artist name in menu bar
ipcMain.on("send-artist", (event, data) => {
  if (JSON.stringify(data) !== JSON.stringify(track_info)) {
    track_info = data;
    tray.setTitle(" " + data.artist);
    tray.setToolTip("Artist: " + data.artist + "\nAlbum: " + data.album + "\nTrack: " + data.track);
  }
});

ipcMain.on('show-context-menu', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  menu.popup(win);
});