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


export function pointsAreKnightMovable(p1, p2) {
    const {y, x} = distanceBetweenPoints(p1, p2)
    
    if(Math.abs(y) === 1 && Math.abs(x) === 2) return true;
    if(Math.abs(x) === 1 && Math.abs(y) === 2) return true;

    return false;
}


export function pointsArePawnMovable(p1, p2, color, moved, gonnaCapture = false) {
    const {y, x} = distanceBetweenPoints(p1, p2)


    if(color === "white" && p1[0] > p2[0]) return false;
    if(color === "black" && p1[0] < p2[0]) return false;

    if(moved && x > 1) {
        return false;
    } else if(!moved && x > 2) {
        return false;
    }


    if(gonnaCapture) {
        if(y !== 1 || x !== 1) {
            return false;
        }
    } else {
        if(y !== 0) return false;
    }
    

    return true;
}

