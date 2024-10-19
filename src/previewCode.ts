import * as vscode from 'vscode';
import { window } from 'vscode';

const COMMAND = `\x0C checkpoint_paste()`; // \x0C is Ctrl + L

/**
 * Interactively previews the given Manim code by means of the
 * `checkpoint_paste()` method from Manim.
 * 
 * This workflow is described in [1] and was adapted from Sublime to VSCode by
 * means of this extension. The main features are discussed in [2]. A demo
 * is shown in the video "How I animate 3Blue1Brown" by Grant Sanderson [3],
 * with the workflow being showcased between 3:32 and 6:48.
 * 
 * [1] https://github.com/3b1b/videos#workflow
 * [2] https://github.com/ManimCommunity/manim/discussions/3954#discussioncomment-10933720
 * [3] https://youtu.be/rbu7Zu5X1zI
 *
 * @param code The code to preview (e.g. from a Manim cell or from a custom selection).
 */
export async function previewCode(code: string): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('Cannot find the active text file.');
        return;
    }

    const clipboardBuffer = await vscode.env.clipboard.readText();
    await vscode.env.clipboard.writeText(code);

    // Send command to interactive IPython shell
    // See the new Terminal shell integration API (from VSCode release 1.93)
    // https://code.visualstudio.com/updates/v1_93#_terminal-shell-integration-api
    const terminal = vscode.window.activeTerminal || vscode.window.createTerminal();
    if (terminal.shellIntegration) {
        terminal.shellIntegration.executeCommand(COMMAND);
    } else {
        terminal.sendText(COMMAND);
    }

    // Restore original clipboard content
    setTimeout(async () => {
        await vscode.env.clipboard.writeText(clipboardBuffer);
    }, 500);
}
