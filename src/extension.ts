// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ManimCell } from './manimcell';
import { CellRangeHandler } from './cellRangeHandler';
import { previewCode } from './previewCode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-manim" is now active!');

	const previewManimViaCell = vscode.commands.registerCommand('vscode-manim.previewManimCell', (cellCode: string | undefined) => {
		// User has executed the command via command pallette
		if (cellCode === undefined) {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showErrorMessage('No opened file found. Place your cursor in a Manim cell.');
				return;
			}
			const document = editor.document;

			const cursorLine = editor.selection.active.line;
			const range = CellRangeHandler.getCellRangeAtLine(document, cursorLine);
			if (!range) {
				vscode.window.showErrorMessage('No code found. Place your cursor in a Manim cell.');
				return;
			}
			cellCode = document.getText(range);
		}

		const succeeded = previewCode(cellCode);
		if (!succeeded) {
			vscode.window.showErrorMessage('Failed to preview Manim code. Take a look at the logs.');
		}
	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable1 = vscode.commands.registerCommand('vscode-manim.helloData', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		// terminal.show();
		vscode.window.showInformationMessage('Hello Data from vscode-manim!');
	});

	const disposable2 = vscode.commands.registerCommand('vscode-manim.checkpointPaste', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		const terminal = vscode.window.activeTerminal || vscode.window.createTerminal();
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			// Get the selected text
			const selection = editor.selection;
			const selectedText = editor.document.getText(selection);

			// Copy the selected text to the clipboard
			await vscode.env.clipboard.writeText(selectedText);

			// Create or show the terminal
			const terminal = vscode.window.activeTerminal || vscode.window.createTerminal();

			// Send the checkpoint_paste() command
			// terminal.sendText('checkpoint_paste()', false);
			terminal.sendText('checkpoint_paste()');

			vscode.window.showInformationMessage('Copied selected code and sent checkpoint_paste() to manim terminal');
		} else {
			vscode.window.showErrorMessage('No text is selected');
		}
	});

	context.subscriptions.push(disposable1, disposable2, previewManimViaCell);

	const manimCell = new ManimCell();
	const codeLensProvider = vscode.languages.registerCodeLensProvider({ language: 'python' }, manimCell);
	const foldingRangeProvider = vscode.languages.registerFoldingRangeProvider({ language: 'python' }, manimCell);
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
