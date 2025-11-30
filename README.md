# CountUp ⏱

A stylish Windows taskbar app that counts up time from when you started - **persists through reboots**.

![CountUp Timer](https://github.com/user-attachments/assets/bebb4c75-33bb-4d49-8c02-bcc572fb163b)

## Features

- **🎯 Simple & Robust**: Start counting and the timer persists even after system reboots
- **📅 Full Time Display**: Shows years, months, days, hours, minutes, and seconds
- **🎨 Stylish UI**: Modern, dark theme with gradient backgrounds and glowing effects
- **📌 System Tray Integration**: Lives in your taskbar, always accessible
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

### Building for Windows

To create a distributable Windows installer:

```bash
npm run build:win
```

The installer will be created in the `dist/` folder.

## Usage

1. **Start the app** - It will appear in your system tray (notification area)
2. **Click the tray icon** to show/hide the timer window
3. **Right-click the tray icon** for quick actions:
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
