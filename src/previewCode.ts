import * as vscode from 'vscode';

/**
 * Interactively previews the given Manim code by means of the
 * `checkpoint_paste()` method from Manim.
 * 
 * This workflow is described in [1] and was adapted from Sublime to VSCode by
 * means of this extension. The main features are discussed in [2]. A demo
 * is shown in the video "How I animate 3Blue1Brown" by Grant Sanderson [3],
 * which the workflow being showcased between 3:32 and 6:48.
 * 
 * [1] https://github.com/3b1b/videos#workflow
 * [2] https://github.com/ManimCommunity/manim/discussions/3954#discussioncomment-10933720
 * [3] https://youtu.be/rbu7Zu5X1zI
 *
 * @param code The code to preview (e.g. from a Manim cell or from a custom selection).
 * @returns True if the preview was successful, false otherwise.
 */
export function previewCode(code: string): boolean {
    // TODO: Implement "preview code", e.g. open terminal, paste command,
    // restore clipboard etc. Here instead some funny dummy implementation.
    vscode.window.showInformationMessage(`Previewing Manim code: ${code}`);
    const lines = code.split('\n');
    for (const line of lines) {
        if (line.trim().startsWith('#')) {
            vscode.window.showInformationMessage(`Got a comment: ${line}`);
        }
    }

    return true;
}
