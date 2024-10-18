import * as vscode from 'vscode';

export class CodeWatcher implements vscode.CodeLensProvider, vscode.FoldingRangeProvider {
    private static readonly PYTHON_CELL_MARKER = /^(##)/;

    constructor() { }

    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] {
        const codeLenses: vscode.CodeLens[] = [];
        const regex = CodeWatcher.PYTHON_CELL_MARKER;

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            if (regex.test(line.text)) {
                const range = new vscode.Range(i, 0, i, line.text.length);
                codeLenses.push(new vscode.CodeLens(range));
            }
        }

        return codeLenses;
    }

    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken): vscode.CodeLens {
        codeLens.command = {
            title: "Python Cell",
            command: "vscode-manim.previewManimCell",
            arguments: []
        };
        return codeLens;
    }

    public provideFoldingRanges(document: vscode.TextDocument, context: vscode.FoldingContext, token: vscode.CancellationToken): vscode.FoldingRange[] {
        const foldingRanges: vscode.FoldingRange[] = [];
        const regex = CodeWatcher.PYTHON_CELL_MARKER;
        let start: number | null = null;

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            if (regex.test(line.text)) {
                if (start !== null) {
                    foldingRanges.push(new vscode.FoldingRange(start, i - 1));
                }
                start = i;
            }
        }

        if (start !== null) {
            foldingRanges.push(new vscode.FoldingRange(start, document.lineCount - 1));
        }

        return foldingRanges;
    }
}
