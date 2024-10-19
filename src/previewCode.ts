import * as vscode from 'vscode';
import { window } from 'vscode';

const IPYTHON_REGEX = /In \[\d+\]:/;
const COMMAND = `checkpoint_paste()`; // \x0C is Ctrl + L

// Avoid overlapping of Manim preview requests
let isPreviewing = false;

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
 * @returns True if the preview was successful, false otherwise.
 */
export async function previewCode(code: string): Promise<void> {
    if (isPreviewing) {
        vscode.window.showInformationMessage('Please wait until the current command finishes executing.');
        return;
    }

    isPreviewing = true;

    try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('Editor not found');
            return;
        }

        const clipboardBuffer = await vscode.env.clipboard.readText();
        await vscode.env.clipboard.writeText(code);

        const terminal = vscode.window.activeTerminal || vscode.window.createTerminal();
        if (!terminal.shellIntegration) {
            vscode.window.showErrorMessage('Shell integration is required for Manim previewing.');
            return;
        }

        // Log all data written to the terminal for a command
        const command = terminal.shellIntegration.executeCommand('echo "Hello world"');
        const stream = command.read();
        for await (const data of stream) {
            console.log(data);
        }

        // const execution = terminal.shellIntegration.executeCommand(COMMAND);

        // https://code.visualstudio.com/updates/v1_93#_terminal-shell-integration-api
        // https://stackoverflow.com/a/77456264/
        // window.onDidStartTerminalShellExecution(async (event: vscode.TerminalShellExecutionStartEvent) => {
        //     console.log('Command started, will read stream');
        //     const stream = event.execution.read();
        //     for await (const data of stream) {
        //         console.log(data);

        //         if (IPYTHON_REGEX.test(data)) {
        //             console.log('Found IPython regex');
        //         }
        //     }

        //     // // read the stream of data from the terminal
        //     // const stream = event.execution.read();
        //     // for await (const data of stream) {
        //     //     console.log(data);

        //     //     if (IPYTHON_REGEX.test(data)) {
        //     //         console.log('Found IPython regex');
        //     //     }
        //     // }
        // });

        // window.onDidChangeTerminalShellIntegration(async (event: vscode.TerminalShellIntegrationChangeEvent) => {
        //     console.log('Terminal shell integration changed');
        //     console.log(event);
        // });

        // const stream = command.read();
        // for await (const data of stream) {
        //     console.log(data);

        //     if (IPYTHON_REGEX.test(data)) {
        //         console.log('Found IPython regex');
        //     }
        // }

        // Restore original clipboard content after 500 ms
        // setTimeout(async () => {
        //     await vscode.env.clipboard.writeText(clipboardBuffer);
        // }, 500);

        // Wait for the terminal to finish the command
        // await new Promise<void>(async (resolve, reject) => {
        //     const stream = command.read();
        //     for await (const data of stream) {
        //         console.log(data);

        //         if (IPYTHON_REGEX.test(data)) {
        //             resolve();
        //         }
        //     }

        //     // Resolve after 10s if the command does not finish
        //     setTimeout(() => {
        //         resolve();
        //     }, 10000);
        // });

    } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error}`);
    } finally {
        isPreviewing = false;
    }
}
