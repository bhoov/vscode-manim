import * as vscode from 'vscode';
import { window } from 'vscode';

const PREVIEW_COMMAND = `\x0C checkpoint_paste()`; // \x0C is Ctrl + L

/**
 * Whether the extension is currently executing a Manim command.
 * 
 * Note that this is not capturing whether the `checkpoint_paste()` command is
 * still running. Instead, it only captures whether reading/writing to clipboard
 * is currently happening to prevent unpredictable behavior.
 * 
 * We don't need to capture the state of `checkpoint_paste()` because users
 * might actually want to preview a cell (or another one) again from the start
 * even though the animation is still running. With the new VSCode terminal
 * shell integration, it will automatically send a `Ctrl + C` to the terminal
 * when a new command is sent, so the previous command will be interrupted.
 */
let isExecuting = false;

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
    if (isExecuting) {
        vscode.window.showInformationMessage('Please wait a few seconds, then try again.');
        return;
    }
    isExecuting = true;

    try {
        const clipboardBuffer = await vscode.env.clipboard.readText();
        await vscode.env.clipboard.writeText(code);

        const terminal = vscode.window.activeTerminal || vscode.window.createTerminal();
        if (!terminal.shellIntegration) {
            await vscode.window.showErrorMessage("No terminal TODO");
            return;
        }


        let currentSceneName: string | undefined = undefined;
        let currentProgress: number = 0;
        let inCount = 0;

        // Send command to terminal and capture output
        window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Previewing Manim",
            cancellable: true
        }, (progress, token) => {
            token.onCancellationRequested(() => {
                console.log("User cancelled the long running operation");
            });

            progress.report({ increment: 0 });

            return new Promise<void>((resolve, reject) => {
                window.onDidStartTerminalShellExecution(
                    async (event: vscode.TerminalShellExecutionStartEvent) => {
                        console.log('onDidStartTerminalShellExecution', event);
                        const stream = event.execution.read();
                        for await (const data of stream) {
                            // TODO: do better regex parsing here
                            const strippedData = strip_ansi_codes(data);
                            console.log(`🎉: ${strippedData}`);

                            if (strippedData.includes("In [")) {
                                if (inCount === 1) {
                                    resolve();
                                    return;
                                }
                                inCount += 1;
                            }

                            if (!data.includes("%")) {
                                continue;
                            }
                            
                            const progressString = data.match(/\b\d{1,2}(?=\s?%)/)?.[0];
                            if (!progressString) {
                                continue;
                            }

                            const newProgress = parseInt(progressString);
                            console.log(`✅ ${newProgress}`);

                            let progressIncrement = newProgress - currentProgress;

                            const split = data.split(" ");
                            if (split.length < 2) {
                                continue;
                            }
                            let sceneName = data.split(" ")[1];
                            // remove last char which is a ":"
                            sceneName = sceneName.substring(0, sceneName.length - 1);
                            if (sceneName !== currentSceneName) {
                                if (currentSceneName === undefined) {
                                    progressIncrement = -currentProgress;
                                }
                                currentSceneName = sceneName;
                            }

                            currentProgress = newProgress;

                            // Update progress
                            progress.report({
                                increment: progressIncrement,
                                message: sceneName
                            });
                        }
                    });

                window.onDidEndTerminalShellExecution(
                    async (event: vscode.TerminalShellExecutionEndEvent) => {
                        console.log('onDidEndTerminalShellExecution', event);
                    });

            });
        });

        terminal.shellIntegration.executeCommand(PREVIEW_COMMAND);

        // Restore original clipboard content
        const timeout = vscode.workspace.getConfiguration("manim-notebook").clipboardTimeout;
        setTimeout(async () => {
            await vscode.env.clipboard.writeText(clipboardBuffer);
        }, timeout);
    } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error}`);
    } finally {
        isExecuting = false;
    }
}

function strip_ansi_codes(s) {
    // https://stackoverflow.com/a/14693789/9655481
    const REGEX = /(\x9B|\x1B\[)[0-?]*[ -\/]*[@-~]/;
    return s.replace(REGEX, '');
}
