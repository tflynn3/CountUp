# CountUp ⏱

A stylish cross-platform system tray/menu bar app that counts up time from when you started - **persists through reboots**.

![CountUp Timer](https://github.com/user-attachments/assets/bebb4c75-33bb-4d49-8c02-bcc572fb163b)

## Features

- **🎯 Simple & Robust**: Start counting and the timer persists even after system reboots
- **📅 Full Time Display**: Shows years, months, days, hours, minutes, and seconds
- **🎨 Stylish UI**: Modern, dark theme with gradient backgrounds and glowing effects
- **📌 System Tray/Menu Bar Integration**: Lives in your system tray (Windows/Linux) or menu bar (macOS), always accessible
- **🔄 Start & Reset**: Easy controls to start a new timer or reset the current one

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/CountUp.git
   cd CountUp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the app:
   ```bash
   npm start
   ```

### Building

#### Windows
```bash
npm run build:win
```

#### macOS
```bash
npm run build:mac
```

#### Linux
```bash
npm run build:linux
```

The installers will be created in the `dist/` folder.

## Platform-Specific Notes

### macOS

**Menu Bar App**: On macOS, CountUp runs as a menu bar app (no Dock icon). Look for the timer icon in your menu bar at the top of the screen.

**Code Signing**: The pre-built releases are not code-signed with an Apple Developer certificate. When running the app for the first time, you may see a security warning. To run the app:

1. **First-time launch**: Right-click (or Control-click) on the app and select "Open"
2. In the dialog that appears, click "Open" to confirm
3. Alternatively, go to **System Preferences > Security & Privacy > General** and click "Open Anyway"

This only needs to be done once per installation. For production deployment with proper code signing, you'll need an Apple Developer account ($99/year) and configure the following environment variables for the build:
- `CSC_LINK` - Path to your .p12 certificate file
- `CSC_KEY_PASSWORD` - Password for the certificate
- `APPLE_ID` - Your Apple ID for notarization
- `APPLE_APP_SPECIFIC_PASSWORD` - App-specific password for notarization

### Windows

The app appears in the system tray (notification area) in the taskbar. If you don't see the icon, check the hidden icons area (click the arrow in the system tray).

### Linux

The app appears in the system tray. Depending on your desktop environment, you may need to install a system tray extension.

## Usage

1. **Start the app** - It will appear in your system tray (Windows/Linux) or menu bar (macOS)
2. **Click the tray/menu bar icon** to show/hide the timer window
3. **Right-click the icon** for quick actions:
   - Show/Hide window
   - Start Counter
   - Reset Counter
   - Quit
4. **Click Start** to begin counting from now
5. **Click Reset** to clear the timer and start fresh

## How It Works

- When you click "Start", the current timestamp is saved to persistent storage
- The app calculates elapsed time from that saved timestamp
- Even if you restart your computer, the original start time is preserved
- Time is displayed in a human-readable format: Years, Months, Days, Hours, Minutes, Seconds

## Technology

- **Electron** - Cross-platform desktop application framework
- **electron-store** - Persistent data storage that survives reboots
- **Modern CSS** - Stylish UI with gradients, blur effects, and animations

## License

Apache License 2.0 - See [LICENSE](LICENSE) for details
