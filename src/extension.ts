// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ManimCell } from './manimCell';
import { ManimCellRanges } from './manimCellRanges';
import { previewCode } from './previewCode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	/**
	 * Command to preview the Manim code of the cell where the cursor is placed
	 * (when accessed via the command pallette) or the code of the cell where
	 * the codelens was clicked.
	 */
	const previewManimCell = vscode.commands.registerCommand('vscode-manim.previewManimCell',
		(cellCode: string | undefined) => {
			// User has executed the command via command pallette
			if (cellCode === undefined) {
				const editor = vscode.window.activeTextEditor;
				if (!editor) {
					vscode.window.showErrorMessage('No opened file found. Place your cursor in a Manim cell.');
					return;
				}
				const document = editor.document;
				
				// Get the code of the cell where the cursor is placed
				const cursorLine = editor.selection.active.line;
				const range = ManimCellRanges.getCellRangeAtLine(document, cursorLine);
				if (!range) {
					vscode.window.showErrorMessage('Place your cursor in a Manim cell.');
					return;
				}
				cellCode = document.getText(range);
			}

			previewCode(cellCode);
		});

	/**
	 * Command to preview the Manim code of the selected text.
	 */
	const previewSelection = vscode.commands.registerCommand('vscode-manim.previewSelection',
		async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showErrorMessage('Select some code to preview.');
				return;
			}

			let selectedText;
			const selection = editor.selection;
			if (selection.isEmpty) {
				// If nothing is selected - select the whole line
				const line = editor.document.lineAt(selection.start.line);
				selectedText = editor.document.getText(line.range);
			} else {
				// If selected - extend selection to start and end of lines
				const range = new vscode.Range(
					editor.document.lineAt(selection.start.line).range.start,
					editor.document.lineAt(selection.end.line).range.end
				);
				selectedText = editor.document.getText(range);

				// TODO (future): If the selection does not start with a comment
				// try to include lines beforehand up to a previous comment
				// if this comment is THRESHOLD away from the first line
				// of the selection.
				// This behavior could be optional and be enabled via a
				// user setting.
			}

			if (!selectedText) {
				vscode.window.showErrorMessage('No text selected in the editor');
				return;
			}

			previewCode(selectedText);
		}
	);

	context.subscriptions.push(previewManimCell, previewSelection);
	registerManimCellProviders(context);
}

/**
 * Registers the Manim cell "providers", e.g. code lenses and folding ranges.
 */
function registerManimCellProviders(context: vscode.ExtensionContext) {
	const manimCell = new ManimCell();

	const codeLensProvider = vscode.languages.registerCodeLensProvider(
		{ language: 'python' }, manimCell);
	const foldingRangeProvider = vscode.languages.registerFoldingRangeProvider(
		{ language: 'python' }, manimCell);
	context.subscriptions.push(codeLensProvider, foldingRangeProvider);

	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			manimCell.applyCellDecorations(editor);
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		const editor = vscode.window.activeTextEditor;
		if (editor && event.document === editor.document) {
			manimCell.applyCellDecorations(editor);
		}
	}, null, context.subscriptions);

	vscode.window.onDidChangeTextEditorSelection(event => {
		manimCell.applyCellDecorations(event.textEditor);
	}, null, context.subscriptions);

	if (vscode.window.activeTextEditor) {
		manimCell.applyCellDecorations(vscode.window.activeTextEditor);
	}
}

// This method is called when your extension is deactivated
export function deactivate() { }
