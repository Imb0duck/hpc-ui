(function () {
    const vscode = acquireVsCodeApi();
    document.getElementById('get-token-button').addEventListener('click', ()=> {
        const login = document.getElementById('login').value;
        const password = document.getElementById('password').value;
        document.getElementById('login').value = "";
        document.getElementById('password').value = "";
        vscode.postMessage({ 
            type: 'requestToken', 
            data: { login, password }
        });
    });
    document.getElementById('get-user-data').addEventListener('click', ()=> {
        vscode.postMessage({ 
            type: 'requestUserData'
        });
    });
    document.getElementById('get-project-list').addEventListener('click', ()=> {
        vscode.postMessage({ 
            type: 'requestProjectList'
        });
    });
    document.getElementById('get-task-list').addEventListener('click', ()=> {
        vscode.postMessage({ 
            type: 'requestTaskList'
        });
    });
    document.getElementById('get-home-file-list').addEventListener('click', ()=> {
        vscode.postMessage({ 
            type: 'requestHomeFileList'
        });
    });
    document.getElementById('get-catalog-file-list').addEventListener('click', ()=> {
        const path = document.getElementById('catalog-path').value;
        document.getElementById('catalog-path').value = "";
        vscode.postMessage({ 
            type: 'requestCatalogFileList', 
            data: { path }
        });
    });
    document.getElementById('create-new-user').addEventListener('click', ()=> {
        const login = document.getElementById('login').value;
        const password = document.getElementById('password').value;
        document.getElementById('login').value = "";
        document.getElementById('password').value = "";
        vscode.postMessage({ 
            type: 'createNewUser', 
            data: { login, password }
        });
    });
    document.getElementById('get-profile-list').addEventListener('click', ()=> {
        vscode.postMessage({ 
            type: 'requestProfileList'
        });
    });
    document.getElementById('create-new-project').addEventListener('click', ()=> {
        vscode.postMessage({ 
            type: 'createNewProject'
        });
    });
    document.getElementById('download-file').addEventListener('click', ()=> {
        const filePath = document.getElementById('file-path').value;
        document.getElementById('file-path').value = "";
        vscode.postMessage({ 
            type: 'downloadFile', 
            data: { filePath }
        });
    });
    document.getElementById('build-project').addEventListener('click', ()=> {
        const projectID = document.getElementById('project-id').value;
        document.getElementById('project-id').value = "";
        vscode.postMessage({
            type: 'buildProject',
            data: { projectID }
        });
    });
    document.getElementById('build-status').addEventListener('click', ()=> {
        const projectID = document.getElementById('project-id').value;
        const buildID = document.getElementById('build-id').value;
        document.getElementById('project-id').value = "";
        document.getElementById('build-id').value = "";
        vscode.postMessage({ 
            type: 'buildStatus', 
            data: { projectID, buildID }
        });
    });
    document.getElementById('create-new-task').addEventListener('click', ()=> {
        vscode.postMessage({ 
            type: 'createNewTask'
        });
    });
    document.getElementById('task-status').addEventListener('click', ()=> {
        const taskID = document.getElementById('task-id').value;
        document.getElementById('task-id').value = "";
        vscode.postMessage({ 
            type: 'taskStatus', 
            data: { taskID }
        });
    });
}());