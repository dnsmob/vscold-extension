// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getDelayForSeverity } from "./severity";
import { AudioManager } from "./audio";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "VS Cold" is now active!');

  // Check if in development mode
  const isDevelopment =
    context.extensionMode === vscode.ExtensionMode.Development;

  // Generate a unique ID for this window
  const windowId = Date.now() + Math.random();

  // Variable to store the current timer
  let currentTimer: NodeJS.Timeout | undefined;

  // Initialize audio manager
  const audioManager = new AudioManager(context.extensionPath);

  // Check if this window should be the master (run the timer)
  const isMasterWindow = (): boolean => {
    const masterId = context.globalState.get<number>("vscold.masterId");
    return masterId === windowId;
  };

  // Claim master status (force claim, overwriting any existing master)
  const claimMaster = async () => {
    await context.globalState.update("vscold.masterId", windowId);
    console.log(`Window ${windowId} claimed master status`);
    return true;
  };

  // Release master status when window closes
  const releaseMaster = async () => {
    if (isMasterWindow()) {
      await context.globalState.update("vscold.masterId", undefined);
      console.log(`Window ${windowId} released master status`);
    }
  };

  // Function to check if extension is disabled
  const isExtensionDisabled = (): boolean => {
    const disabledInState = context.globalState.get<boolean>(
      "vscold.disabled",
      false
    );
    const disabledInConfig = !vscode.workspace
      .getConfiguration("vscold")
      .get<boolean>("enabled", true);
    return disabledInState || disabledInConfig;
  };

  // Function to cancel any existing timer
  const cancelTimer = () => {
    clearTimeout(currentTimer);
    currentTimer = undefined;
  };

  // Function to schedule a new timer
  const scheduleTimer = () => {
    cancelTimer();

    // Don't schedule if disabled or not master window
    if (isExtensionDisabled() || !isMasterWindow()) {
      return;
    }

    // Get delay based on severity setting
    const delay = getDelayForSeverity();
    let severity = vscode.workspace
      .getConfiguration("vscold")
      .get<string>("severity", "sniffles");

    console.log(
      `Timer set for ${delay}ms (${(delay / 1000 / 60).toFixed(
        1
      )} minutes) - Severity: ${severity}`
    );

    // Show toast notification for new cycle
    if (isDevelopment) {
      vscode.window.showInformationMessage(
        `🤧 New sneeze cycle started (${severity} mode)`
      );
    }

    // Set timer to play sound after the random delay
    currentTimer = setTimeout(() => {
      // Check if we have audio files to play
      if (!audioManager.hasAudioFiles()) {
        console.warn("No audio files found in audio directory");
        vscode.window.showWarningMessage(
          "⚠️ No audio files found in vscold/audio directory"
        );
        return;
      }

      // Play random audio file
      audioManager.playRandomAudio();

      // Show notification only in dev mode
      if (isDevelopment) {
        vscode.window.showInformationMessage("🤒 Bless you!");
      }

      // Schedule the next timer
      scheduleTimer();
    }, delay);
  };

  // Claim master status and start the timer when the extension activates
  claimMaster().then(() => {
    scheduleTimer();
  });

  // Listen for window focus changes to claim master if needed
  const windowStateListener = vscode.window.onDidChangeWindowState((state) => {
    if (state.focused) {
      // This window gained focus, try to claim master status
      claimMaster().then(() => {
        console.log("Window gained focus and claimed master status");
        scheduleTimer();
      });
    } else if (!state.focused) {
      // This window lost focus and is master, cancel timer
      console.log("Window lost focus, cancelling timer");
      cancelTimer();
    }
  });

  // Register command to stop the timer
  const stopTimerCommand = vscode.commands.registerCommand(
    "vscold.stopTimer",
    () => {
      cancelTimer();
      console.log("Timer stopped by user command");

      // Update configuration to disable the extension
      const config = vscode.workspace.getConfiguration("vscold");
      config.update("enabled", false, vscode.ConfigurationTarget.Global);

      // Also store in global state for redundancy
      context.globalState.update("vscold.disabled", true);

      vscode.window.showInformationMessage(
        "💊 VS Cold disabled - Taking medicine!"
      );
    }
  );

  // Register command to enable the timer
  const enableTimerCommand = vscode.commands.registerCommand(
    "vscold.enableTimer",
    () => {
      // Clear disabled state
      context.globalState.update("vscold.disabled", false);
      // Also update configuration
      vscode.workspace
        .getConfiguration("vscold")
        .update("enabled", true, vscode.ConfigurationTarget.Global);
      console.log("VS Cold enabled");

      // Start a new timer
      scheduleTimer();

      vscode.window.showInformationMessage(
        "🦠 VS Cold enabled - Getting sick!"
      );
    }
  );

  // Listen for configuration changes
  const configChangeListener = vscode.workspace.onDidChangeConfiguration(
    (e) => {
      if (e.affectsConfiguration("vscold.enabled")) {
        const enabled = vscode.workspace
          .getConfiguration("vscold")
          .get<boolean>("enabled", true);
        console.log(`Configuration changed: vscold.enabled = ${enabled}`);

        // Update global state to match configuration
        context.globalState.update("vscold.disabled", !enabled);

        if (enabled) {
          // Enable - restart timer
          scheduleTimer();
          console.log("Timer restarted due to configuration change");
          return;
        }

        // Disable - stop current timer
        cancelTimer();
        console.log("Timer stopped due to configuration change");
      }
    }
  );

  context.subscriptions.push(
    stopTimerCommand,
    enableTimerCommand,
    configChangeListener,
    windowStateListener,
    // Release master status when extension deactivates
    { dispose: () => void releaseMaster() }
  );
}

// This method is called when your extension is deactivated
export function deactivate() {
  // Master status will be released via the dispose function above
}
