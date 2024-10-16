// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-manim" is now active!');




	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable1 = vscode.commands.registerCommand('vscode-manim.helloData', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		// terminal.show();
		vscode.window.showInformationMessage('Hello Data from vscode-manim!');
	});




	let isExecuting = false;  // Flag: to prevent several commands executing at the same time (because clipboard saving would become uncontrollable in this case)
	const disposable2 = vscode.commands.registerCommand('vscode-manim.checkpointPaste', async () => {
		if (isExecuting) {
			vscode.window.showInformationMessage('Please wait until the current command finishes executing.');
			return;
		}

		isExecuting = true;
		try {
			// Editor must be found:
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showErrorMessage('Editor not found');
				return;
			}
			let selectedText;
			if (editor.selection.isEmpty) {
				// If nothing is selected - select the whole line (for convenience):
				const line = editor.document.lineAt(editor.selection.start.line);
				selectedText = editor.document.getText(line.range);
			} else {
				// If selected - extend selection to start and end of lines (for convenience):
				const range = new vscode.Range(
					editor.selection.start.with(undefined, 0),
					editor.selection.end.with(undefined, Number.MAX_SAFE_INTEGER)
				);
				selectedText = editor.document.getText(range);
			}
			// Selected text must not be empty:
			if (!selectedText) {
				vscode.window.showErrorMessage('No text selected in the editor');
				return;
			}

			// Save current clipboard content
			const clipboardBuffer = await vscode.env.clipboard.readText();

			// Copy the selected text to the clipboard
			await vscode.env.clipboard.writeText(selectedText);

			// Create or show the terminal
			const terminal = vscode.window.activeTerminal || vscode.window.createTerminal();

			// Send the checkpoint_paste() command
			terminal.sendText(
				'\x0C' +  // to center the terminal (Command + l)
				'checkpoint_paste()'
			);

			// move 1 line down in the text editor (to get ready to execute next line)
			await vscode.commands.executeCommand('cursorDown');

			// Restore original clipboard content
			await new Promise(resolve => setTimeout(resolve, 500));  // must wait a bit (so that checkpoint_paste() above doesn't capture the next clipboard)
			await vscode.env.clipboard.writeText(clipboardBuffer);

		} catch (error) {
			vscode.window.showErrorMessage(`Error: ${error}`);
		} finally {
			isExecuting = false;
		}
	});


	context.subscriptions.push(disposable1, disposable2);
}

// This method is called when your extension is deactivated
export function deactivate() {}
