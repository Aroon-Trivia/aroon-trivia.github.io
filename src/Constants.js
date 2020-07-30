const baseURL = 'http://localhost:8080';

export const answerURL = `${baseURL}/answer`;
export const questionURL = `${baseURL}/question`;
export const socketURL = `${baseURL}`;

export function questionStyleReadable(questionStyle) {
    switch (questionStyle) {
        case 'wager':
            return 'Wager';
        case 'wagerLoss':
            return 'Wager with Loss';
        case 'pointPer':
            return 'Point per Question';
        case 'custom':
            return 'Gamemaster Chooses';
        default:
            return ''
    }
}