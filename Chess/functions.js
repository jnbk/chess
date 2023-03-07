import { LETTERS } from "./consts.js";

/**
 * Mení x súradnicu na písmeno
 * @param {Number} x x súradnica
 * @returns {String}
 */
export function xToLetter(x) {
    return LETTERS[x];
}

/**
 * Mení písmeno na x súradnicu
 * @param {String} letter písmeno
 * @returns {Number}
 */
export function letterToX(letter) {
    return LETTERS.indexOf(letter);
}

/**
 * Mení súradnice na pole XY
 * @param {String} coordinates 
 * @returns {Number[]}
 */
export function coordinatesToXY(coordinates) {
    const x = Number(coordinates[1]) - 1,
        y = letterToX(coordinates[0]);

    return [x, y];
}

/**
 * Mení X, Y na súradnice
 * @param {Number} x 
 * @param {Number} y 
 * @returns {String}
 */
export function XYToCoordinates(x, y) {
    return xToLetter(y) + String(x + 1);
}


/**
 * Preloží white a black
 * @param {String} color Farba hráča
 * @returns {String}
 */
export function colorToSlovak(color) {
    return color === "white" ? "biely" : "čierny";
}