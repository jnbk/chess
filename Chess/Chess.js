import ChessBoard from "./ChessBoard.js";
import { KING, LETTERS, QUEEN, START_POSITIONS } from "./consts.js";
import { coordinatesToXY as cToXY, distanceBetweenPoints, pointsAreDiagonal, pointsAreStraightLine } from "./functions.js";

export default class Chess extends EventTarget {

    history = [];
    game = {};

    board = [];

    constructor() {
        super();
    }

    startGame() {
        this.resetGame();
    }

    resetGame() {
        this.history = [];
        this.game = {
            type: "default", 
            size: "8x8", 
            onTurn: "white",
        };
        this.board = Chess.generateBoard();
        this.setStartPosition(START_POSITIONS);
    }

    // helpers

    setStartPosition(pos) {
        for(let coordinates in pos) {
            const data = pos[coordinates];
            this.setFieldPiece(...cToXY(coordinates), data.piece, data.pieceColor);
        }
    }
    getField(x, y) {
        return this.board[x][y];
    }
    setFieldPiece(x, y, piece = null, pieceColor = null) {
        const field = this.getField(x, y);
        field.piece = piece;
        field.pieceColor = pieceColor;
        this.dispatchEvent(this.customEvent("fieldset", {
            x, 
            y, 
            piece, 
            pieceColor
        }));
        return this;
    }
    move(from, to) {
        const fromXY = cToXY(from),
            toXY = cToXY(to),
            fromField = this.getField(...fromXY);

        if(!this.canMove(fromXY, toXY)) return false;

        this.setFieldPiece(...toXY, fromField.piece, fromField.pieceColor);
        this.setFieldPiece(...fromXY, null, null);
        return true;
    }
    canMove(fromXY, toXY) {
        if(!Array.isArray(fromXY)) fromXY = cToXY(fromXY);
        if(!Array.isArray(toXY)) toXY = cToXY(toXY);

        const from = this.getField(...fromXY),
            to = this.getField(...toXY),
            fromColor = from.pieceColor,
            toColor = to.pieceColor,
            fromP = from.piece,
            toP = to.piece,
            distance = distanceBetweenPoints(fromXY, toXY);

        if(fromColor === toColor) return false;

        if(fromP === KING) {
            if(distance.max > 1) return false;
        } else if(fromP === QUEEN) {
            if(!pointsAreDiagonal(fromXY, toXY) && !pointsAreStraightLine(fromXY, toXY)) return false;
        }

        return true;
    }

    

    // events

    customEvent(event, options = {}) {
        return new CustomEvent(event, {
            detail: {
                ...options,
                chess: this,
            }
        });
    }

    


    // static funcs

    static generateBoard() {
        const arr = [];
        for(let i = 0; i < 8; i++) {
            const row = [];
            for(let j = 0; j < 8; j++) {
                row.push({
                    piece: null,
                    pieceColor: null,
                    coordinates: LETTERS[j] + (i + 1),
                });
            }
            arr.push(row);
        }
        return arr;
    }

    static getTilesLayout() {
        const reverseColors = lastClr => {
            if(lastClr === "black") {
                lastClr = "white";
            } else {
                lastClr = "black";
            }
            return lastClr;
        }

        const tiles = [];
        let lastClr = "white";
        for(let i = 0; i < 8; i++) {
            const row = [];
            for(let j = 0; j < 8; j++) {
                lastClr = reverseColors(lastClr);
                row.push({
                    coordinates: LETTERS[j] + (i + 1),
                    color: lastClr
                });
            }
            lastClr = reverseColors(lastClr);
            tiles.push(row);
        }
        return tiles;
    }
}