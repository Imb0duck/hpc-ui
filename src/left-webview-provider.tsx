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

    printTree(directory: { dirs: string[]; files: string[] }, indent: string = ''): void {
		console.log(`${indent}directory/`);
		indent += '    ';

        for (const dir of directory.dirs) {
			console.log(`${indent}${dir}/`);
		}

        for (const file of directory.files) {
			console.log(`${indent}${file}`);
		}
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
								console.log(`Code: ${parsedData.code}` + '\n' + `Error Type: ${parsedData.errorType}` 
									+ '\n' + `Error Message: ${parsedData.errorMessage}`)
								window.showInformationMessage(parsedData.errorMessage);
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
				case "requestUserData": {
					if(userdata.token === ""){
						window.showInformationMessage("Missing token");
						break;
					}
					this.executeCommand("curl -X GET \ http://hpccloud.ssd.sscc.ru/api/1.0/users?access_token=" + userdata.token)
					.then(output => {
						try {
							const parsedData = JSON.parse(output);
						  
							if ('users' in parsedData) {
								console.log(`ID: ${parsedData.id}` + '\n' + `Level: ${parsedData.lvl}` 
									+ '\n' + `Login: ${parsedData.login}` + '\n' + `Password: ${parsedData.password}` 
									+ '\n' + `Firstname: ${parsedData.firstname}` + '\n' + `Lasname: ${parsedData.lastname}` 
									+ '\n' + `Email: ${parsedData.e_mail}` + '\n' + `Phone:  ${parsedData.phone}`);
							} else if ('errorType' in parsedData) {
								console.log(`Code: ${parsedData.code}` + '\n' + `Error Type: ${parsedData.errorType}` 
									+ '\n' + `Error Message: ${parsedData.errorMessage}`)
								window.showInformationMessage(parsedData.errorMessage);
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
				case "requestProjectList": {
					this.executeCommand("curl -X GET \ http://hpccloud.ssd.sscc.ru/api/1.0/projects?access_token=" + userdata.token)
					.then(output => {
						try {
							const parsedData = JSON.parse(output);
						  
							console.log(output); //Make a normal output 
						  } catch (error) {
							console.error("Error with JSON parsing:", error);
						  }
					}).catch(error => {
						console.error(error);
					});
					break;
				}
				case "requestTaskList": {
					this.executeCommand("curl -X GET \ http://hpccloud.ssd.sscc.ru/api/1.0/jobs?access_token=" + userdata.token)
					.then(output => {
						try {
							const parsedData = JSON.parse(output);
						  
							console.log(output); //Make a normal output 
						  } catch (error) {
							console.error("Error with JSON parsing:", error);
						  }
					}).catch(error => {
						console.error(error);
					});
					break;
				}
				case "requestHomeFileList": {
					this.executeCommand("curl -X GET \ http://hpccloud.ssd.sscc.ru/api/1.0/fs/?access_token=" + userdata.token)
					.then(output => {
						try {
							const parsedData = JSON.parse(output);
						  
							if ('directory' in parsedData) {
								this.printTree(parsedData);
							} else if ('errorType' in parsedData) {
								console.log(`Code: ${parsedData.code}` + '\n' + `Error Type: ${parsedData.errorType}` 
									+ '\n' + `Error Message: ${parsedData.errorMessage}`)
								window.showInformationMessage(parsedData.errorMessage);
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
				<input class="input-field" type="text" placeholder="path to catalog"  id="catalog-path" name="catalog-path">
				<input class="input-field" type="text" placeholder="path to file"  id="file-path" name="file-path">
				<input class="input-field" type="text" placeholder="project ID"  id="project-id" name="project-id">
				<input class="input-field" type="text" placeholder="build ID"  id="build-id" name="build-id">
				<input class="input-field" type="text" placeholder="task ID"  id="task-id" name="task-id">
                <button id="get-token-button">GET TOKEN</button>
				<button id="get-user-data">USER DATA</button>
				<button id="get-project-list">PROJECT LIST</button>
				<button id="get-task-list">TASK LIST</button>
				<button id="get-home-file-list">FILE LIST(HOME)</button>
				<button id="get-catalog-file-list">FILE LIST(CATALOG)</button>
				<button id="create-new-user">NEW USER</button>
				<button id="get-profile-list">PROFILE LIST</button>
				<button id="create-new-project">NEW PROJECT</button>
				<button id="download-file">DOWNLOAD FILE</button>
				<button id="build-project">BUILD PROJECT</button>
				<button id="build-status">BUILD STATUS</button>
				<button id="create-new-task">CREATE TASK</button>
				<button id="task-status">TASK STATUS</button>
            </div>

			<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}
