import * as vscode from 'vscode';

/**
 * Executes the given command in the VSCode terminal:
 * - either using shell integration (if supported),
 * - otherwise using `sendText`.
 * 
 * @param command The command to execute in the VSCode terminal.
 */
export function executeTerminalCommand(command: string): void {
    // See the new Terminal shell integration API (from VSCode release 1.93)
    // https://code.visualstudio.com/updates/v1_93#_terminal-shell-integration-api
    const terminal = vscode.window.activeTerminal || vscode.window.createTerminal();
    if (terminal.shellIntegration) {
        terminal.shellIntegration.executeCommand(command);
    } else {
        terminal.sendText(command);
    }
}
