import ChessBoard from "./ChessBoard.js";
import { BISHOP, KING, KNIGHT, LETTERS, PAWN, QUEEN, ROOK, START_POSITIONS } from "./consts.js";
import { coordinatesToXY as cToXY } from "./functions.js";

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
    nextTurn() {
        if(this.game.onTurn === "white") {
            this.game.onTurn = "black";
        } else {
            this.game.onTurn = "white";
        }
        this.dispatchEvent(this.customEvent("turn", {
            onTurn: this.game.onTurn
        }));
    }

    // helpers

    setStartPosition(pos) {
        for(let coordinates in pos) {
            const data = pos[coordinates];
            this.setFieldPiece(...cToXY(coordinates), data.piece, data.pieceColor, false);
        }
    }
    getField(x, y) {
        return this.board[x][y];
    }
    setFieldPiece(x, y, piece = null, pieceColor = null, moved = true) {
        const field = this.getField(x, y);
        field.piece = piece;
        field.pieceColor = pieceColor;
        field.moved = moved;
        this.dispatchEvent(this.customEvent("fieldset", {
            x, 
            y, 
            piece, 
            pieceColor,
            moved,
        }));
        return this;
    }
    move(from, to) {
        const fromXY = cToXY(from),
            toXY = cToXY(to),
            fromField = this.getField(...fromXY);

        if(!this.canMove(fromXY, toXY)) return false;


        fromField.moved = true;
        this.nextTurn();

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
            distance = this.distanceBetweenPoints(fromXY, toXY);

        if(fromColor === toColor) return false;
        if(fromColor !== this.game.onTurn) return false;

        if(fromP === KING) {
            if(distance.max > 1) return false;
        } else if(fromP === QUEEN) {
            const pointsAreDiagonal = this.pointsAreDiagonal(fromXY, toXY),
                pointsAreStraightLine = this.pointsAreStraightLine(fromXY, toXY);
            if(!pointsAreDiagonal && !pointsAreStraightLine) return false;

            let fields;
                if(pointsAreStraightLine) {
                    fields = this.getStraightLineFieldsBetweenPoints(fromXY, toXY);
                } else {
                    fields = this.getDiagonalFieldsBetweenPoints(fromXY, toXY);
                }
            
            if(!this.fieldsAreFree(fields)) return false;

        } else if(fromP === ROOK) {
            if(!this.pointsAreStraightLine(fromXY, toXY)) return false;
            if(!this.fieldsAreFree(this.getStraightLineFieldsBetweenPoints(fromXY, toXY))) return false;
        } else if(fromP === BISHOP) {
            if(!this.pointsAreDiagonal(fromXY, toXY)) return false;
            if(!this.fieldsAreFree(this.getDiagonalFieldsBetweenPoints(fromXY, toXY))) return false;
        } else if(fromP === KNIGHT) {
            if(!this.pointsAreKnightMovable(fromXY, toXY)) return false;
        } else if(fromP === PAWN) {
            if(!this.pointsArePawnMovable(fromXY, toXY, fromColor, from.moved, !!toP)) return false;
            if(!this.fieldsAreFree(this.getStraightLineFieldsBetweenPoints(fromXY, toXY))) return false;
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

    // helpers

    distanceBetweenPoints(p1, p2) {
        const [x1, y1] = p1,
            [x2, y2] = p2;
    
        let x = x1 - x2,
            y = y1 - y2,
            xDist = Math.abs(x),
            yDist = Math.abs(y);

        let maxReal;
        if(Math.abs(x) > Math.abs(y)) {
            maxReal = x;
        } else {
            maxReal = y;
        }
        
    
        return {
            x: xDist,
            y: yDist,
            xReal: x1 - x2,
            yReal: y1 - y2,
            max: Math.max(xDist, yDist),
            maxReal
        }
    }
    
    pointsAreDiagonal(p1, p2) {
        const {y, x} = this.distanceBetweenPoints(p1, p2)
        if(y !== x) return false;
    
        return true;
    }
    
    
    pointsAreStraightLine(p1, p2) {
        const {y, x} = this.distanceBetweenPoints(p1, p2)
        if(y !== 0 && x !== 0) return false;
    
        return true;
    }
    
    
    pointsAreKnightMovable(p1, p2) {
        const {y, x} = this.distanceBetweenPoints(p1, p2)
        
        if(Math.abs(y) === 1 && Math.abs(x) === 2) return true;
        if(Math.abs(x) === 1 && Math.abs(y) === 2) return true;
    
        return false;
    }
    
    
    pointsArePawnMovable(p1, p2, color, moved, gonnaCapture = false) {
        const {y, x} = this.distanceBetweenPoints(p1, p2)
    
    
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

    getStraightLineFieldsBetweenPoints(p1, p2, inclusive = false) {
        if(!this.pointsAreStraightLine(p1, p2)) return [];

        const fields = [];

        const {y, x} = this.distanceBetweenPoints(p1, p2);
        if(x > 0) {
            for(let i = Math.min(p1[0], p2[0]); i < Math.max(p1[0], p2[0]); i++) {
                if(!inclusive && [p1[0], p2[0]].includes(i)) continue; 

                fields.push(this.getField(i, p1[1]))
            }
        } else if(y > 0) {
            for(let i = Math.min(p1[1], p2[1]); i < Math.max(p1[1], p2[1]); i++) {
                if(!inclusive && [p1[1], p2[1]].includes(i)) continue; 

                fields.push(this.getField(p1[0], i))
            }
        }

        return fields;
    }

    getDiagonalFieldsBetweenPoints(p1, p2, inclusive = false) {
        if(!this.pointsAreDiagonal(p1, p2)) return [];

        const fields = [];

        const {maxReal, xReal, yReal} = this.distanceBetweenPoints(p1, p2);

        for(let i = 0; i <= Math.abs(maxReal); i++) {
            const x = p1[0] + (xReal < 0 ? i : -i),
                y = p1[1] + (yReal < 0 ? i : -i);
            if(
                !inclusive &&
                (
                    [p1[0], p2[0]].includes(x) ||
                    [p1[1], p2[1]].includes(y)
                )
            ) continue;
            fields.push(this.getField(x, y))
        }
        

        return fields;
    }
    
    
    fieldsAreFree(fields) {
        for(let i = 0; i < fields.length; i++) {
            if(fields[i].piece) return false;
        }
        return true;
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