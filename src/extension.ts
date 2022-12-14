// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "prairie-learn-helper" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// // The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('prairie-learn-helper.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Prairie Learn Helper!');
	});
	context.subscriptions.push(disposable);

	let disposable2 = vscode.commands.registerCommand('prairie-learn-helper.questionDefinitionProvider', () => {
		console.log("defintionProvider triggered");
		const editor = vscode.window.activeTextEditor;
		if (editor && vscode.workspace.workspaceFolders !== undefined) {
			console.log("editor present");
			let infoAssessmentContent = JSON.parse(editor.document.getText());
			let questions = [];
			for (var zone of infoAssessmentContent.zones) {
				for (var question of zone.questions) {
					questions.push(question);
				}
			}		
			console.log(infoAssessmentContent);
			var i = 0;
			for (var question of questions) {
				for (var j = 0; j < editor.document.lineCount && i < questions.length; j++) {
					console.log(`checking line ${j}`);
					let line = editor.document.lineAt(j);
					let lineText = line.text;
					if (lineText.includes(question.id)) {
						let start = lineText.indexOf(question.id) - 1;
						let end = start + question.id.length + 2;
						let f = vscode.workspace.workspaceFolders[0].uri.fsPath; 	
						let uri = `${f}\\questions\\${question.id.replace('\/', '\\')}`;

						vscode.languages.registerDefinitionProvider({
							language: 'json',
							scheme: 'file',
							pattern: editor.document.uri.fsPath
						} as vscode.DocumentFilter, {
							provideDefinition: async (document, position, token) => {
								console.log('provideDefinition triggered');
								if (vscode.workspace.workspaceFolders !== undefined && position.line === line.lineNumber) {
									// let success = await vscode.commands.executeCommand('vscode.openFolder', uri);
									return new vscode.Location(vscode.Uri.file(uri + '\\question.html'), new vscode.Range(0, 0, 0, 0));
								}
							}
						});
						
						vscode.languages.registerHoverProvider(['json', 'jsonc'], {
							provideHover(document, position, token) {
								console.log('hover triggered');
								if (vscode.workspace.workspaceFolders !== undefined && position.line === line.lineNumber) {
									return new vscode.Hover(`Link to question uri: ${uri}`, new vscode.Range(line.lineNumber, start, line.lineNumber, end));
								}
							}
						});
					};
				};
			};
		} else {
			let message = "Prairie Learn Helper: Working folder not found, open a folder an try again" ;
			vscode.window.showErrorMessage(message);
		};
	});
	context.subscriptions.push(disposable2);
};

export function deactivate(context: vscode.ExtensionContext) {
	console.log("deactivating");
	context.subscriptions.map(() => typeof(context.subscriptions[0]).dispose);
}


interface MyDefinitionProvider extends vscode.DefinitionProvider {
	someTrackingId: number;
}
