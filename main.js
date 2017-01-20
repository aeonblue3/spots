'use strict';

const {BrowserWindow, Tray, app, ipcMain} = require('electron')
  , path = require('path')
  , url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
  , tray;

// Listener to update artist name in menu bar
ipcMain.on("send-artist", (event, artist) => {
  tray.setTitle(artist);
})

/**
 * Instantiate an instance of BrowserWindow
 * 
 * @return void
 */
function createWindow () {
  const tray_position = tray.getBounds();

  // Create the browser window.
  mainWindow = new BrowserWindow({
      width: 460
    , height: 300
    , x: tray_position.x
    , y: tray_position.y
    , frame: false
    , show: false
    , backgroundColor: "#333333"
  });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html')
    , protocol: 'file:'
    , slashes: true
  }));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
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
  })
  mainWindow.on('show', () => {
    tray.setHighlightMode('always');
  })
  mainWindow.on('hide', () => {
    tray.setHighlightMode('never');
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createTray);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
