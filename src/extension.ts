import * as vscode from 'vscode';
import { ManimCell } from './manimCell';
import { ManimCellRanges } from './manimCellRanges';
import { previewCode } from './previewCode';
import { executeTerminalCommand } from './executeTerminalCommand';

export function activate(context: vscode.ExtensionContext) {

	const previewManimCellCommand = vscode.commands.registerCommand(
		'manim-notebook.previewManimCell', (cellCode: string | undefined) => {
			previewManimCell(cellCode);
		});

	const previewSelectionCommand = vscode.commands.registerCommand(
		'manim-notebook.previewSelection', () => {
			previewSelection();
		}
	);

	const startSceneCommand = vscode.commands.registerCommand(
		'manim-notebook.startScene', () => {
			startScene();
		}
	);

	const exitSceneCommand = vscode.commands.registerCommand(
		'manim-notebook.exitScene', () => {
			exitScene();
		}
	);

	const clearSceneCommand = vscode.commands.registerCommand(
		'manim-notebook.clearScene', () => {
			clearScene();
		}
	);

	context.subscriptions.push(
		previewManimCellCommand,
		previewSelectionCommand,
		startSceneCommand,
		exitSceneCommand,
		clearSceneCommand
	);
	registerManimCellProviders(context);
}

export function deactivate() { }




// --------------------------------- Helpers: ---------------------------------

/**
 * Command to preview the Manim code of the cell where the cursor is placed
 * (when accessed via the command pallette) or the code of the cell where
 * the codelens was clicked.
 */
function previewManimCell(cellCode: string | undefined) {
	// User has executed the command via command pallette
	if (cellCode === undefined) {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage(
				'No opened file found. Place your cursor in a Manim cell.');
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
}

/**
 * Command to preview the Manim code of the selected text.
 */
function previewSelection() {
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
	}

	if (!selectedText) {
		vscode.window.showErrorMessage('Select some code to preview.');
		return;
	}

	previewCode(selectedText);
}

/**
 * Runs the `manimgl` command in the terminal, with the current cursor's line number:
 * manimgl <file_name> <ClassName> [-se <line_number>]
 * 
 * Notes:
 * - it saves the active file
 * - it loads the scene in the state it would be BETWEEN the cursor's line and the next line
 * - if the cursor is on a class definition line, `-se <line_number>` is NOT added (i.e. it loads the whole scene)
 * - (3b1b's version also copied this command to the clipboard with additional args `--prerun --finder -w`)
 */
async function startScene() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage(
			'No opened file found. Please place your cursor at a line of code.'
		);
		return;
	}

	// Save the active file:
	vscode.commands.executeCommand('workbench.action.files.save');

	// Just in case:
	const languageId = editor.document.languageId;
	if (languageId !== 'python') {
		vscode.window.showErrorMessage('File must be in Python');
		return;
	}

	const contents = editor.document.getText();
	const all_lines = contents.split("\n");

	// Find which lines define classes
	// E.g. here, class_lines = [{ line: "class FirstScene(Scene):", index: 3 }, ...]
	const class_lines = all_lines
		.map((line, index) => ({ line, index }))
		.filter(({ line }) => /^class (.+?)\((.+?)\):/.test(line));

	// Where the cursor is (row = line)
	const row = editor.selection.start.line;

	// Find the first class defined before where the cursor is
	// E.g. here, matching_class = { line: "class SelectedScene(Scene):", index: 42 }
	const matching_class = class_lines
		.reverse()
		.find(({ index }) => index <= row);
	if (!matching_class) {
		vscode.window.showErrorMessage('No class found for the cursor position.');
		return;
	}
	// E.g. here, scene_name = "SelectedScene"
	const scene_name = matching_class.line.slice("class ".length, matching_class.line.indexOf("("));

	// While line is empty - make it the previous line
	// (because `manimgl -se <line_number>` doesn't work on empty lines)
	let line_number = row;
	while (all_lines[line_number].trim() === "") {
		line_number--;
	}

	// Create the command
	const file_path = editor.document.fileName;  // absolute path
	const cmds = ["manimgl", file_path, scene_name];
	let enter = false;
	if (row !== matching_class.index) {
		cmds.push(`-se ${line_number + 1}`);
		enter = true;
	}
	const command = cmds.join(" ");

	// // Commented out - in case someone would like it.
	// // For us - we want to NOT overwrite our clipboard.
	// // If one wants to run it in a different terminal,
	// // it's often to write to a file
	// await vscode.env.clipboard.writeText(command + " --prerun --finder -w");

	// Run the command
	executeTerminalCommand(command);

	// // Commented out - in case someone would like it.
	// // For us - it would require MacOS. Also - the effect is not desired.
	// // Focus some windows (ONLY for MacOS because it uses `osascript`!)
	// const terminal = vscode.window.activeTerminal || vscode.window.createTerminal();
	// if (enter) {
	// 	// Keep cursor where it started (in VSCode)
	// 	const cmd_focus_vscode = 'osascript -e "tell application \\"Visual Studio Code\\" to activate"';
	// 	// Execute the command in the shell after a delay (to give the animation window enough time to open)
	// 	await new Promise(resolve => setTimeout(resolve, 2500));
	// 	require('child_process').exec(cmd_focus_vscode);
	// } else {
	// 	terminal.show();
	// }
}

/**
 * Runs the `exit()` command in the terminal.
 * It closes the animation window and the IPython terminal.
 */
function exitScene() {
	executeTerminalCommand("exit()");
}

/**
 * Runs the `clear()` command in the terminal.
 * It removes all objects from the scene.
 */
function clearScene() {
	executeTerminalCommand("clear()");
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
