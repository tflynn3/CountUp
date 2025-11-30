const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, screen } = require('electron');
const path = require('path');
const Store = require('electron-store').default;

// Initialize electron-store for persistent storage
const store = new Store({
  defaults: {
    startTime: null,
    isRunning: false,
    eventName: 'I started tracking',
    resetHistory: [] // Array of { timestamp, duration } objects
  }
});

let mainWindow = null;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 400,
    resizable: false,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
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
  // Create tray icon - use template image for macOS menu bar
  const iconPath = path.join(__dirname, '..', 'assets', 'icon.png');
  let trayIcon;
  
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      // Create a simple colored icon if file doesn't exist
      trayIcon = createDefaultIcon();
    } else {
      // Resize for tray (16x16 is standard for menu bar on macOS, 16-32 for Windows)
      trayIcon = trayIcon.resize({ width: 16, height: 16 });
      // On macOS, set as template image for proper dark/light mode support
      if (process.platform === 'darwin') {
        trayIcon.setTemplateImage(true);
      }
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
  const display = screen.getDisplayMatching(trayBounds);
  const workArea = display.workArea;
  const padding = 10; // Padding from screen edges

  // Calculate position - platform-specific positioning
  let x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));
  let y;
  
  if (process.platform === 'darwin') {
    // macOS: menu bar is at the top, so window appears below the tray icon
    y = Math.round(trayBounds.y + trayBounds.height + padding);
  } else {
    // Windows/Linux: taskbar is typically at the bottom, so window appears above the tray icon
    y = Math.round(trayBounds.y - windowBounds.height - padding);
  }

  // Ensure window doesn't go past the right edge of the screen
  if (x + windowBounds.width > workArea.x + workArea.width - padding) {
    x = workArea.x + workArea.width - windowBounds.width - padding;
  }

  // Ensure window doesn't go past the left edge of the screen
  if (x < workArea.x + padding) {
    x = workArea.x + padding;
  }

  // Ensure window doesn't go above the top of the screen
  if (y < workArea.y + padding) {
    y = workArea.y + padding;
  }
  
  // Ensure window doesn't go past the bottom of the screen
  if (y + windowBounds.height > workArea.y + workArea.height - padding) {
    y = workArea.y + workArea.height - windowBounds.height - padding;
  }

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
  // Record the reset in history before clearing
  const startTime = store.get('startTime');
  if (startTime) {
    const duration = Date.now() - startTime;
    const resetHistory = store.get('resetHistory') || [];
    resetHistory.push({
      timestamp: Date.now(),
      duration: duration
    });
    // Keep only last 30 days of history
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const filteredHistory = resetHistory.filter(r => r.timestamp > thirtyDaysAgo);
    store.set('resetHistory', filteredHistory);
  }
  
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

ipcMain.handle('get-event-name', () => {
  return store.get('eventName');
});

ipcMain.handle('set-event-name', (event, name) => {
  // Validate and sanitize input
  if (typeof name !== 'string') {
    return false;
  }
  // Limit to 100 characters and trim
  const sanitizedName = name.trim().slice(0, 100);
  store.set('eventName', sanitizedName || 'I started tracking');
  return true;
});

ipcMain.handle('get-reset-history', () => {
  return store.get('resetHistory') || [];
});

ipcMain.handle('get-stats', () => {
  const resetHistory = store.get('resetHistory') || [];
  const now = Date.now();
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
  
  // Helper function for consistent date formatting (YYYY-MM-DD)
  const formatDateKey = (timestamp) => {
    const d = new Date(timestamp);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  
  // Helper for display date format
  const formatDisplayDate = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString();
  };
  
  // Filter to last 7 days
  const weekResets = resetHistory.filter(r => r.timestamp > sevenDaysAgo);
  
  // Group by day using consistent date keys
  const dailyStats = {};
  const dateDisplayMap = {};
  for (let i = 0; i < 7; i++) {
    const timestamp = now - (i * 24 * 60 * 60 * 1000);
    const dateKey = formatDateKey(timestamp);
    dailyStats[dateKey] = { count: 0, totalDuration: 0 };
    dateDisplayMap[dateKey] = formatDisplayDate(timestamp);
  }
  
  weekResets.forEach(reset => {
    const dateKey = formatDateKey(reset.timestamp);
    if (dailyStats[dateKey]) {
      dailyStats[dateKey].count++;
      dailyStats[dateKey].totalDuration += reset.duration;
    }
  });
  
  // Calculate averages and use display dates for output
  const stats = Object.entries(dailyStats).map(([dateKey, data]) => ({
    date: dateDisplayMap[dateKey],
    resets: data.count,
    avgDuration: data.count > 0 ? Math.round(data.totalDuration / data.count) : 0
  })).reverse();
  
  return stats;
});

// App lifecycle
app.whenReady().then(() => {
  // On macOS, hide from dock to make it a true menu bar app
  if (process.platform === 'darwin') {
    app.dock.hide();
  }
  
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
