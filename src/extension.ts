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

	const disposable2 = vscode.commands.registerCommand('vscode-manim.checkpointPaste', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		const terminal = vscode.window.activeTerminal || vscode.window.createTerminal();
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			// Get the selected text
			const selection = editor.selection;
			const selectedText = editor.document.getText(selection);

			// Save current clipboard to a buffer variable
			const clipboardBuffer = await vscode.env.clipboard.readText();

			// Copy the selected text to the clipboard
			await vscode.env.clipboard.writeText(selectedText);
	
			// Create or show the terminal
			const terminal = vscode.window.activeTerminal || vscode.window.createTerminal();
			
			// Send the checkpoint_paste() command
			// terminal.sendText('checkpoint_paste()', false);
			terminal.sendText('checkpoint_paste()');

			// Paste back the buffer variable into the clipboard
			await vscode.env.clipboard.writeText(clipboardBuffer);
	
			vscode.window.showInformationMessage('Copied selected code and sent checkpoint_paste() to manim terminal');
		} else {
			vscode.window.showErrorMessage('No text is selected');
		}
	});

	context.subscriptions.push(disposable1, disposable2);
}

// This method is called when your extension is deactivated
export function deactivate() {}
