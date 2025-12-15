// Electron main process for Venice Local
// Creates the desktop window and loads our app shell.
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // Build the main browser window with preload access.
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 720,
    backgroundColor: '#DEE1DD',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false // Simplified for prototype; allows renderer to access required APIs
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  // Show the UI when Electron is ready.
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // Quit on all platforms except macOS (common Electron pattern).
  if (process.platform !== 'darwin') app.quit();
});
