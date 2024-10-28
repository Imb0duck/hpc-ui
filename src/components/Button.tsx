/* eslint-disable @typescript-eslint/naming-convention */
interface ButtonProps{
    onClick: () => void;
}

function Button({onClick}: ButtonProps){
    return (
        <button id={'GET_TOKEN_BUTTON'} onClick={onClick}>
            Get token
        </button>
    );
}

export default Button;