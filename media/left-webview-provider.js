/*(function () {
    const vscode = acquireVsCodeApi();
    document.getElementById('GET_TOKEN_BUTTON').addEventListener('click', ()=> {
        vscode.postMessage({ 
            type: 'requestToken', 
            data: 'Token requested'
        });
    });
}());*/

import React from 'react';
import ReactDOM from 'react-dom';
import LeftPanel from './components/LeftPanel';

const vscode = acquireVsCodeApi();

// Рендерим компонент в DOM
ReactDOM.render(<LeftPanel message="HPC UI" />, document.getElementById('root'));