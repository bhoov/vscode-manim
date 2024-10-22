import * as vscode from 'vscode';
import { ManimCell } from './manimCell';
import { ManimCellRanges } from './manimCellRanges';
import { previewCode } from './previewCode';

export function activate(context: vscode.ExtensionContext) {

	const previewManimCellCommand = vscode.commands.registerCommand(
		'vscode-manim.previewManimCell', (cellCode: string | undefined) => {
			previewManimCell(cellCode);
		});

	const previewSelectionCommand = vscode.commands.registerCommand(
		'vscode-manim.previewSelection', () => {
			previewSelection();
		}
	);

	const runSceneCommand = vscode.commands.registerCommand(
		'vscode-manim.runScene', () => {
			runScene();
		}
	);

	context.subscriptions.push(
		previewManimCellCommand,
		previewSelectionCommand,
		runSceneCommand
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
 * - it loads the scene as it would be AFTER this line
 * - if the cursor is on a class definition line, `-se <line_number>` is NOT added (i.e. it loads the whole scene)
 * - also copies that command to the clipboard with additional args: `--prerun --finder -w`
 * 
 * - this function is only for MacOS (because it uses `osascript` to focus the VSCode window)
 */
async function runScene() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage('Editor not found');
		return;
	}

	// Save the active file:
	vscode.commands.executeCommand('workbench.action.files.save');

	const file_path = editor.document.fileName;  // absolute path
	if (!file_path.endsWith('.py')) {
		vscode.window.showErrorMessage('Check failed: file must end with .py');
		return;
	}

	const contents = editor.document.getText();
	const all_lines = contents.split("\n");

	// Find which lines define classes
	const class_lines = all_lines  // E.g., class_lines = [{ line: "class FirstScene(Scene):", index: 3 }, ...]
		.map((line, index) => ({ line, index }))
		.filter(({ line }) => /^class (.+?)\((.+?)\):/.test(line));

	// Where is the cursor (row = line)
	const row = editor.selection.start.line;

	// Find the first class defined before where the cursor is
	const matching_class = class_lines  // E.g., matching_class = { line: "class SelectedScene(Scene):", index: 42 }
		.reverse()
		.find(({ index }) => index <= row);
	if (!matching_class) {
		vscode.window.showErrorMessage('No matching classes');
		return;
	}
	const scene_name = matching_class.line.slice("class ".length, matching_class.line.indexOf("("));  // E.g., scene_name = "SelectedScene"

	// Create the command
	const cmds = ["manimgl", file_path, scene_name];
	let enter = false;
	if (row !== matching_class.index) {
		cmds.push(`-se ${row + 1}`);
		enter = true;
	}
	const command = cmds.join(" ");

	// If one wants to run it in a different terminal,
	// it's often to write to a file
	await vscode.env.clipboard.writeText(command + " --prerun --finder -w");

	// Run the command
	const terminal = vscode.window.activeTerminal || vscode.window.createTerminal();
	terminal.sendText(command);

	// // Focus some windows (ONLY MacOS). Commented out because it's not really needed too much??
	// if (enter) {
	// 	// Keep cursor where it started (in VSCode)
	// 	const cmd_focus_vscode = 'osascript -e "tell application \\"Visual Studio Code\\" to activate"';
	// 	// Execute the command in the shell after a delay (to give the animation window enough time to open)
	// 	await new Promise(resolve => setTimeout(resolve, 2500));
	// 	require('child_process').exec(cmd_focus_vscode);
	// } else {
	// 	terminal.show();
	// }

	// // Info for debugging:
	// console.log('file_path:', file_path);
	// console.log('row:', row);
	// // console.log('contents:', contents);
	// // console.log('all_lines:', all_lines);
	// console.log('class_lines:', class_lines);
	// console.log('matching_class:', matching_class);
	// console.log('scene_name:', scene_name);
	// console.log('command:', command);
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
