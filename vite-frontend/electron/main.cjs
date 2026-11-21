const path = require('node:path');
const { app, BrowserWindow, shell } = require('electron');
const { registerPanelStoreHandlers } = require('./panel-store.cjs');

const developmentUrl = 'http://127.0.0.1:3000';

function openExternal(url) {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      void shell.openExternal(parsedUrl.href);
    }
  } catch {
    // Ignore malformed URLs requested by the renderer.
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url === mainWindow.webContents.getURL()) {
      return;
    }

    event.preventDefault();
    openExternal(url);
  });

  if (!app.isPackaged) {
    void mainWindow.loadURL(developmentUrl);
  } else {
    void mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  registerPanelStoreHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
