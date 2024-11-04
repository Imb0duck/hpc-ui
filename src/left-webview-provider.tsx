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
					if(userdata.token === ""){
						window.showInformationMessage("Missing token");
						break;
					}
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
				case "requestJobList": {
					if(userdata.token === ""){
						window.showInformationMessage("Missing token");
						break;
					}
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
					if(userdata.token === ""){
						window.showInformationMessage("Missing token");
						break;
					}
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
				case "requestCatalogFileList": {
					if(userdata.token === ""){
						window.showInformationMessage("Missing token");
						break;
					}
					this.executeCommand("curl -X GET \ http://hpccloud.ssd.sscc.ru/api/1.0/fs/" + message.path + "/?access_token=" + userdata.token)
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
				case "createNewUser": {
					const userForm = '{"lvl":' + message.lvl + ', "firstname":' + message.firstname + ', "lastname":' + message.lastname 
					+ ', "e_mail":' + message.e_mail + ', "access_code":' + message.access_code + '}';
					this.executeCommand('curl -X POST http://' + message.login + ':' + message.password 
						+ '@hpccloud.ssd.sscc.ru/api/1.0/users --header "Content-Type: application/json" -d ' + userForm)
					.then(output => {
						try {
							const parsedData = JSON.parse(output);
						  
								console.log(output); //Make a normal output
							    if ('errorType' in parsedData) {
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
				case "requestProfileList": {
					if(userdata.token === ""){
						window.showInformationMessage("Missing token");
						break;
					}
					this.executeCommand("curl -X GET \ https://hpccloud.ssd.sscc.ru/api/1.0/clusters/profiles?access_token=" + userdata.token)
					.then(output => {
						try {
							const parsedData = JSON.parse(output);
						  
							console.log(output); //Make a normal output
							    if ('errorType' in parsedData) {
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
				case "createNewProject": {
					if(userdata.token === ""){
						window.showInformationMessage("Missing token");
						break;
					}

					const projectForm = '{"type":' + message.type + ',"name":' + message.projectName + ',"template":' + message.template 
					+ ',"cluster_profile":' + message.cluster_profile + ',"make_configuration":' + message.make_config + '}';
					this.executeCommand('curl -X POST https://hpccloud.ssd.sscc.ru/api/1.0/projects?access_token=' 
						+ userdata.token + ' --header "Content-Type: application/json" -d ' + projectForm)
					.then(output => {
						try {
							const parsedData = JSON.parse(output);
						  
							if ('project_id' in parsedData) {
								console.log(`Project ID: ${parsedData.project_id}` + '\n' + `Configuration ID: ${parsedData.make_configuration_id}`);
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
				case "downloadFile": {
					if(userdata.token === ""){
						window.showInformationMessage("Missing token");
						break;
					}
					this.executeCommand("curl -X GET http://hpccloud.ssd.sscc.ru/api/1.0/fs/apps/myappname/" + message.filePath 
						+ "?access_token=" + userdata.token)
					.then(output => {
						try {
							const parsedData = JSON.parse(output);
						  
							console.log(output); //Make a normal output
							 if ('errorType' in parsedData) {
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
				case "buildProject": {
					if(userdata.token === ""){
						window.showInformationMessage("Missing token");
						break;
					}

					this.executeCommand('curl -X POST https://hpccloud.ssd.sscc.ru/api/1.0/projects/' + message.projectID 
						+ '/builds?access_token=' + userdata.token)
					.then(output => {
						try {
							const parsedData = JSON.parse(output);
						  
							if ('make_configuration_id' in parsedData) {
								console.log(`Configuration ID: ${parsedData.make_configuration_id}` + '\n' + `Build ID: ${parsedData.build_id}`);
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
				case "buildStatus": {
					if(userdata.token === ""){
						window.showInformationMessage("Missing token");
						break;
					}

					this.executeCommand('curl -X GET https://hpccloud.ssd.sscc.ru/api/1.0/projects/' 
						+ message.projectID + '/builds/' + message.buildID + '?access_token=' + userdata.token)
					.then(output => {
						try {
							const parsedData = JSON.parse(output);
						  
							if ('state' in parsedData) {
								console.log(`State: ${parsedData.state}` + '\n' + `Message: ${parsedData.message}`);
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
				case "createNewTask": {}
				case "taskStatus": {
					if(userdata.token === ""){
						window.showInformationMessage("Missing token");
						break;
					}

					this.executeCommand('curl -X GET https://hpccloud.ssd.sscc.ru/api/1.0/jobs/' + message.taskID + '?access_token=' + userdata.token)
					.then(output => {
						try {
							const parsedData = JSON.parse(output);
						  
							if ('id' in parsedData) {
								console.log(`Job ID: ${parsedData.id}` + '\n' + `User ID: ${parsedData.user_id}` 
									 + '\n' + `Name: ${parsedData.name}` + '\n' + `Last modify time: ${parsedData.last_modify_time}` 
									 + '\n' + `Type: ${parsedData.type}` + '\n' + `Cluster profile id: ${parsedData.cluster_profile_id}`
									 + '\n' + `State: ${parsedData.state}` + '\n' + `Place: ${parsedData.place}`
									 + '\n' + `Walltime: ${parsedData.walltime}` + '\n' + `Environment variables: ${parsedData.env_vars}`
									 + '\n' + `Arguments: ${parsedData.args}` + '\n' + `Queue name: ${parsedData.queue_name}` 
									 + '\n' + `Queue_id: ${parsedData.queue_id}`);
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
                <button id="get-token-button">GET TOKEN</button>
				<button id="get-user-data">USER DATA</button>
				<button id="get-project-list">PROJECT LIST</button>
				<button id="get-job-list">JOB LIST</button>
				<button id="get-home-file-list">FILE LIST(HOME)</button>

				<input class="input-field" type="text" placeholder="path to catalog"  id="catalog-path" name="catalog-path">
				<button id="get-catalog-file-list">FILE LIST(CATALOG)</button>

				<input class="input-field" type="text" placeholder="login" id="new-login" name="login">
                <input class="input-field" type="password" placeholder="password"  id="new-password" name="password">
				<input class="input-field" type="text" placeholder="lvl" id="lvl" name="lvl">
				<input class="input-field" type="text" placeholder="firstname" id="firstname" name="firstname">
				<input class="input-field" type="text" placeholder="lastname" id="lastname" name="lastname">
				<input class="input-field" type="text" placeholder="e_mail" id="e_mail" name="e_mail">
				<input class="input-field" type="text" placeholder="access_code" id="access_code" name="access_code">
				<button id="create-new-user">NEW USER</button>

				<button id="get-profile-list">PROFILE LIST</button>

				<input class="input-field" type="text" placeholder="type" id="project-type" name="project-type">
				<input class="input-field" type="text" placeholder="name" id="project-name" name="project-name">
				<input class="input-field" type="text" placeholder="template" id="template" name="template">
				<input class="input-field" type="text" placeholder="cluster_profile" id="cluster_profile" name="cluster_profile">
				<input class="input-field" type="text" placeholder="make_configuration" id="make_configuration" name="make_configuration">
				<button id="create-new-project">NEW PROJECT</button>

				<input class="input-field" type="text" placeholder="path to file"  id="file-path" name="file-path">
				<button id="download-file">DOWNLOAD FILE</button>

				<input class="input-field" type="text" placeholder="project ID"  id="project-id" name="project-id">
				<button id="build-project">BUILD PROJECT</button>

				<input class="input-field" type="text" placeholder="project ID"  id="build-project-id" name="build-project-id">
				<input class="input-field" type="text" placeholder="build ID"  id="build-id" name="build-id">
				<button id="build-status">BUILD STATUS</button>

				<button id="create-new-task">CREATE TASK</button>

				<input class="input-field" type="text" placeholder="task ID"  id="task-id" name="task-id">
				<button id="task-status">TASK STATUS</button>
            </div>

			<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}
