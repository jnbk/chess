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

export function XYToCoordinates(x, y) {
    return xToLetter(y) + String(x + 1);
}


export function colorToSlovak(color) {
    return color === "white" ? "biely" : "čierny";
}