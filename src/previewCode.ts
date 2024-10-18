import * as vscode from 'vscode';

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
