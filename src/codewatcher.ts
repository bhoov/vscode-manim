import * as vscode from 'vscode';

export class CodeWatcher implements vscode.CodeLensProvider {
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
            command: "",
            arguments: []
        };
        return codeLens;
    }
}
