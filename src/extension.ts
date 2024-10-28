import * as vscode from 'vscode';
import { LeftPanelWebview } from "./left-webview-provider";

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "hpc-ui" is now active!');

	const disposable = vscode.commands.registerCommand('hpc-ui.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from hpc-ui!');
	});
	context.subscriptions.push(disposable);

	const leftPanelWebViewProvider = new LeftPanelWebview(context?.extensionUri, {});
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"hpc-sidebar",
			leftPanelWebViewProvider,
		)
	);
}

export function deactivate() {}
