import * as vscode from 'vscode';

export class CellRangeHandler {

    private static readonly MARKER = /^(\s*##)/;

    public static calculateCellRanges(document: vscode.TextDocument): vscode.Range[] {
        const ranges: vscode.Range[] = [];
        let start: number | null = null;
        let startIndent: number | null = null;

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);

            if (line.isEmptyOrWhitespace) {
                continue;
            }

            const currentIndent = line.firstNonWhitespaceCharacterIndex;

            if (CellRangeHandler.MARKER.test(line.text)) {
                if (start !== null) {
                    ranges.push(this.constructNewRange(start, i - 1, document));
                }
                start = i;
                startIndent = currentIndent;
            } else if (start !== null && startIndent !== null && startIndent > currentIndent) {
                ranges.push(this.constructNewRange(start, i - 1, document));
                start = null;
                startIndent = null;
            }
        }

        if (start !== null) {
            ranges.push(this.constructNewRange(start, document.lineCount - 1, document));
        }

        return ranges;
    }

    public static getCellRangeAtLine(document: vscode.TextDocument, line: number): vscode.Range | null {
        const ranges = CellRangeHandler.calculateCellRanges(document);
        for (const range of ranges) {
            if (range.start.line <= line && line <= range.end.line) {
                return range;
            }
        }
        return null;
    }

    private static constructNewRange(start: number, end: number,
        document: vscode.TextDocument): vscode.Range {
        let endLine = document.lineAt(end);
        const endNew = endLine.isEmptyOrWhitespace ? end - 1 : end;
        if (endNew !== end) {
            endLine = document.lineAt(endNew);
        }
        return new vscode.Range(start, 0, endNew, endLine.text.length);
    }

}
