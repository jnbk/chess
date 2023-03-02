import { LETTERS } from "./consts.js";


export function xToLetter(x) {
    return LETTERS[x];
}

export function letterToX(letter) {
    return LETTERS.indexOf(letter);
}

export function coordinatesToXY(coordinates) {
    const x = Number(coordinates[1]) - 1,
        y = letterToX(coordinates[0]);

    return [x, y];
}

export function distanceBetweenPoints(p1, p2) {
    const [x1, y1] = p1,
        [x2, y2] = p2;

    let xDist = 0,
        yDist = 0;
    
    xDist = Math.abs(x1 - x2);
    yDist = Math.abs(y1 - y2);

    return {
        x: xDist,
        y: yDist,
        max: Math.max(xDist, yDist)
    }
}

export function pointsAreDiagonal(p1, p2) {
    const {y, x} = distanceBetweenPoints(p1, p2)
    if(y !== x) return false;

    return true;
}


export function pointsAreStraightLine(p1, p2) {
    const {y, x} = distanceBetweenPoints(p1, p2)
    if(y !== 0 && x !== 0) return false;

    return true;
}

