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

	const disposable2 = vscode.commands.registerCommand('vscode-manim.checkpointPaste', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		const terminal = vscode.window.activeTerminal || vscode.window.createTerminal();
        terminal.sendText('checkpoint_paste()');
		vscode.window.showInformationMessage('Copied code and sent to manim terminal');
	});

	context.subscriptions.push(disposable1, disposable2);
}

// This method is called when your extension is deactivated
export function deactivate() {}
