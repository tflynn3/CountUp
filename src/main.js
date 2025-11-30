const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage } = require('electron');
const path = require('path');
const Store = require('electron-store').default;

// Initialize electron-store for persistent storage
const store = new Store({
  defaults: {
    startTime: null,
    isRunning: false
  }
});

let mainWindow = null;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 300,
    resizable: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('blur', () => {
    mainWindow.hide();
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  // Create a simple tray icon using nativeImage
  const iconPath = path.join(__dirname, '..', 'assets', 'icon.png');
  let trayIcon;
  
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      // Create a simple colored icon if file doesn't exist
      trayIcon = createDefaultIcon();
    }
  } catch (error) {
    trayIcon = createDefaultIcon();
  }

  tray = new Tray(trayIcon);
  tray.setToolTip('CountUp - Time Tracker');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show/Hide',
      click: () => toggleWindow()
    },
    {
      label: 'Start Counter',
      click: () => {
        startCounter();
        if (mainWindow) {
          mainWindow.webContents.send('counter-started');
        }
      }
    },
    {
      label: 'Reset Counter',
      click: () => {
        resetCounter();
        if (mainWindow) {
          mainWindow.webContents.send('counter-reset');
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    toggleWindow();
  });
}

function createDefaultIcon() {
  // Create a simple 16x16 icon
  const size = 16;
  const canvas = Buffer.alloc(size * size * 4);
  
  // Fill with a nice blue color
  for (let i = 0; i < size * size; i++) {
    canvas[i * 4] = 66;     // R
    canvas[i * 4 + 1] = 133; // G
    canvas[i * 4 + 2] = 244; // B
    canvas[i * 4 + 3] = 255; // A
  }
  
  return nativeImage.createFromBuffer(canvas, { width: size, height: size });
}

function toggleWindow() {
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    showWindow();
  }
}

function showWindow() {
  // Position window near tray
  const windowBounds = mainWindow.getBounds();
  const trayBounds = tray.getBounds();

  // Calculate position (appears above the tray icon)
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));
  const y = Math.round(trayBounds.y - windowBounds.height - 10);

  mainWindow.setPosition(x, y);
  mainWindow.show();
  mainWindow.focus();
}

function startCounter() {
  if (!store.get('startTime')) {
    store.set('startTime', Date.now());
    store.set('isRunning', true);
  }
}

function resetCounter() {
  store.set('startTime', null);
  store.set('isRunning', false);
}

// IPC handlers for renderer process
ipcMain.handle('get-start-time', () => {
  return store.get('startTime');
});

ipcMain.handle('get-is-running', () => {
  return store.get('isRunning');
});

ipcMain.handle('start-counter', () => {
  startCounter();
  return store.get('startTime');
});

ipcMain.handle('reset-counter', () => {
  resetCounter();
  return true;
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Don't quit on window close - keep in tray
});

app.on('before-quit', () => {
  app.isQuitting = true;
});
