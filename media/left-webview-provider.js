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
}());