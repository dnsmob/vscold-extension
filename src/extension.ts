// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getDelayForSeverity } from './severity';
import { AudioManager } from './audio';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "VS Cold" is now active!');

    // Check if in development mode
    const isDevelopment = context.extensionMode === vscode.ExtensionMode.Development;

    // Variable to store the current timer
    let currentTimer: NodeJS.Timeout | undefined;

    // Initialize audio manager
    const audioManager = new AudioManager(context.extensionPath);

    // Function to check if extension is disabled
    const isExtensionDisabled = (): boolean => {
        const disabledInState = context.globalState.get<boolean>('vscold.disabled', false);
        const disabledInConfig = !vscode.workspace.getConfiguration('vscold').get<boolean>('enabled', true);
        return disabledInState || disabledInConfig;
    };

    // Function to schedule a new timer
    const scheduleTimer = () => {
        // Don't schedule if disabled
        if (isExtensionDisabled()) {
            return;
        }

        // Get delay based on severity setting
        const delay = getDelayForSeverity();
        let severity = vscode.workspace.getConfiguration('vscold').get<string>('severity', 'sniffles');
        
        // Reset to sniffles if annoying mode is selected in production
        if (severity === 'annoying' && !isDevelopment) {
            severity = 'sniffles';
            vscode.workspace.getConfiguration('vscold').update('severity', 'sniffles', vscode.ConfigurationTarget.Global);
        }
        
        console.log(`Timer set for ${delay}ms (${(delay / 1000 / 60).toFixed(1)} minutes) - Severity: ${severity}`);
        
        // Show toast notification for new cycle
        vscode.window.showInformationMessage(`🤧 New sneeze cycle started (${severity} mode)`);
        
        // Set timer to play sound after the random delay
        currentTimer = setTimeout(() => {
            // Check if we have audio files to play
            if (!audioManager.hasAudioFiles()) {
                console.warn('No audio files found in audio directory');
                vscode.window.showWarningMessage('⚠️ No audio files found in vscold/audio directory');
                return;
            }

            // Play random audio file
            audioManager.playRandomAudio();
            
            // Show notification only in dev mode
            if (context.extensionMode === vscode.ExtensionMode.Development) {
                vscode.window.showInformationMessage('⏰ Bless you!');
            }
            
            // Schedule the next timer
            scheduleTimer();
        }, delay);
    };

    // Listen for when files are opened
    const openDocumentListener = vscode.workspace.onDidOpenTextDocument((document) => {
        // Don't do anything if disabled
        if (isExtensionDisabled()) {
            return;
        }

        // Cancel any existing timer
        if (currentTimer) {
            clearTimeout(currentTimer);
            console.log('Previous timer cancelled');
        }

        // Schedule a new timer
        scheduleTimer();
    });

    // Register command to stop the timer
    const stopTimerCommand = vscode.commands.registerCommand('vscold.stopTimer', () => {
        if (currentTimer) {
            clearTimeout(currentTimer);
            currentTimer = undefined;
            console.log('Timer stopped by user');
        }
        
        // Save disabled state
        context.globalState.update('vscold.disabled', true);
        // Also update configuration
        vscode.workspace.getConfiguration('vscold').update('enabled', false, vscode.ConfigurationTarget.Global);
        console.log('VS Cold disabled permanently');
        vscode.window.showInformationMessage('⏱️ VS Cold disabled');
    });

    // Register command to enable the timer
    const enableTimerCommand = vscode.commands.registerCommand('vscold.enableTimer', () => {
        // Clear disabled state
        context.globalState.update('vscold.disabled', false);
        // Also update configuration
        vscode.workspace.getConfiguration('vscold').update('enabled', true, vscode.ConfigurationTarget.Global);
        console.log('VS Cold enabled');
        vscode.window.showInformationMessage('✅ VS Cold enabled');
    });

    // Listen for configuration changes
    const configChangeListener = vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('vscold.enabled')) {
            const enabled = vscode.workspace.getConfiguration('vscold').get<boolean>('enabled', true);
            console.log(`Configuration changed: vscold.enabled = ${enabled}`);
            
            // Update global state to match configuration
            context.globalState.update('vscold.disabled', !enabled);
            
            if (!enabled && currentTimer) {
                // Disable - stop current timer
                clearTimeout(currentTimer);
                currentTimer = undefined;
                console.log('Timer stopped due to configuration change');
            }
        }
    });

    context.subscriptions.push(openDocumentListener, stopTimerCommand, enableTimerCommand, configChangeListener);
}

// This method is called when your extension is deactivated
export function deactivate() {}