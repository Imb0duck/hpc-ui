/* eslint-disable @typescript-eslint/naming-convention */
import React, { useState } from 'react';
//import React, { useRef } from 'react';
import Button from './Button';
import * as vscode from 'vscode';

interface LeftPanelProp {
    message: string
}

const LeftPanel: React.FC<LeftPanelProp> = ({message} ) => {

    /*const login = useRef(null);
    const password = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        const vscode = (window as any).acquireVsCodeApi();
        vscode.postMessage({
            type: 'loginData',
            data: {login, password}
        });
        login.current.value = '';
        password.current.value = '';
      };*/

    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const vscode = (window as any).acquireVsCodeApi();

    const handleSubmit = () => {
        vscode.postMessage({
            type: 'loginData',
            data: {login, password}
        });
        setLogin('');
        setPassword('');
    };

    return (
        <div className='panel-wrapper'>
        <span className='panel-info'>{message}</span>

        <input
        type="text"
        placeholder="login"
        className="input-field"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
        />
        <input
        type="password"
        placeholder="password"
        className="input-field"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        />
            <Button onClick={handleSubmit}></Button>
        </div>

        /*<form onSubmit={handleSubmit}>
        <input ref={login} type="text" placeholder="login" />
        <input ref={password} type="text" placeholder="password" />
        <button onClick={handleSubmit} type="submit"></button>
        </form>*/
    );
}

export default LeftPanel;