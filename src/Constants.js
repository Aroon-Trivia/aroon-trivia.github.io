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
            return 'Point-per-Question';
        case 'custom':
            return 'Gamemaster Chooses';
        default:
            return ''
    }
}

export const wagerDesc = 'The players choose how many points to wager on their question. If they get it right, those points are added to their score. If they get it wrong, there is no penalty.';
export const wagerLossDesc = 'The players choose how many points to wager on their question. If they get it right, those points are added to their score. If they get it wrong, those points are subtracted from their score.';
export const pointPerDesc = 'The players get one point added to their scores if they get it right.';
export const customDesc = 'The Gamemaster chooses how many points to award each player for their answer. Great for open-ended questions!';