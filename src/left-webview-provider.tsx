import { WebviewViewProvider, WebviewView, Webview, Uri, EventEmitter, window } from "vscode";
import { getNonce } from "./getNonce";
import userdata from './userdata';
import { exec } from 'child_process';
import LeftPanel from './components/LeftPanel';
import * as ReactDOMServer from "react-dom/server";

export class LeftPanelWebview implements WebviewViewProvider {
	constructor(
		private readonly extensionPath: Uri,
		private data: any,
		private _view: any = null
	) { }
	private onDidChangeTreeData: EventEmitter<any | undefined | null | void> = new EventEmitter<any | undefined | null | void>();

	refresh(context: any): void {
		this.onDidChangeTreeData.fire(null);
		this._view.webview.html = this._getHtmlForWebview(this._view?.webview);
	}

	resolveWebviewView(webviewView: WebviewView): void | Thenable<void> {
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this.extensionPath],
		};
		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
		this._view = webviewView;
		this.activateMessageListener();
	}

	executeCommand(command: string): Promise<string> {
		return new Promise((resolve, reject) => {
		  exec(command, (error, stdout, stderr) => {
			if (error) {
			  reject(`${stderr}`);
			} else {
			  resolve(stdout);
			}
		  });
		});
	  }

	private activateMessageListener() {

		this._view.webview.onDidReceiveMessage((message) => {
			switch (message.type) {
				case "requestToken": {
					if (!message.data) {
					  return;
					}
					userdata.login = message.login;
					userdata.password = message.password;
					this.executeCommand("curl -X GET http://" + userdata.login + ":" + userdata.password + "@hpccloud.ssd.sscc.ru/api/1.0/tokens")
					.then(output => {
						try {
							const parsedData = JSON.parse(output);
						  
							if ('tokens' in parsedData) {
								userdata.token = parsedData.tokens[0].token;
								userdata.user_id = parsedData.tokens[0].user_id;
								window.showInformationMessage("Token requested");
							} else if ('errorType' in parsedData) {
								const code = parsedData.code;
								const errorType = parsedData.errorType;
								const errorMessage = parsedData.errorMessage;
								window.showInformationMessage(`Code: ${code}`);
								window.showInformationMessage(`Error Type: ${errorType}`);
								window.showInformationMessage(`Error Message: ${errorMessage}`);
							} else {
								console.log("Unknown data type");
							}
						  } catch (error) {
							console.error("Error with JSON parsing:", error);
						  }
					}).catch(error => {
						console.error(error);
					});
					break;
				  }
				case "loginData": {
					if (!message.data) {
					  return;
					}
					window.showInformationMessage(message.data.login);
					break;
				  }
				case "onInfo": {
				  if (!message.data) {
					return;
				  }
				  window.showInformationMessage(message.data);
				  break;
				}
				case "onError": {
				  if (!message.data) {
					return;
				  }
				  window.showErrorMessage(message.data);
				  break;
				}
			  }
		});
	}

	private _getHtmlForWebview(webview: Webview) {
		
		const scriptUri = webview.asWebviewUri(
			Uri.joinPath(this.extensionPath, "media", "left-webview-provider.js")
		);

		const styleUri = webview.asWebviewUri(
			Uri.joinPath(this.extensionPath, "media", "left-webview-provider.css")
		);

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

			return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<meta http-equiv="Content-Security-Policy" 
				content="default-src 'none'; 
				img-src vscode-resource: https:; style-src ${webview.cspSource} 'unsafe-inline'; 
				script-src 'nonce-${nonce}';">
				<link rel="stylesheet" href="${styleUri}">
				<title>HPC UI</title>
			</head>
			<body>

			<div class='panel-wrapper'>
                <input class="input-field" type="text" placeholder="login" id="login" name="login">
                <input class="input-field" type="password" placeholder="password"  id="password" name="password">
                <button id="get-token-button">GET TOKEN</button>
            </div>

			<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}
