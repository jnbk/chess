import Chess from "./Chess.js";
import { PIECES_ICONS } from "./consts.js";

export default class ChessBoard {
    fields = [];

    constructor(rootElement) {
        const $ = this.rootElement = rootElement;
        
        {
            $.attachShadow({
                mode: "open"
            });
            const root = $.shadowRoot;
            root.innerHTML = `<link rel="stylesheet" href="./Chess/style/ChessBoard.css"><div id="app"></div>`;
            root.app = root.getElementById("app");
            this.root = root;

            root.addEventListener("dragstart", this.on.dragstart);
            root.addEventListener("dragover", this.on.dragover);
            root.addEventListener("dragenter", this.on.dragenter);
            root.addEventListener("dragleave", this.on.dragleave);
            root.addEventListener("dragend", this.on.dragend);
            root.addEventListener("drop", this.on.drop);
        }

        const game = this.game = new Chess();
        game.addEventListener("fieldset", e => this.fillField(e.detail.x, e.detail.y, e.detail.piece, e.detail.pieceColor))
    }

    startGame() {
        this.removeBoard();
        this.createBoard();
        this.game.startGame();
        return this;
    }

    fillField(x, y, piece = null, pieceColor = null) {
        const field = this.fields[x][y].content;
        field.innerHTML = ``;
        if(piece) {
            field.innerHTML = `<div class='piece' draggable="true">${PIECES_ICONS[pieceColor][piece]}</div>`;
            field.dataset.pieceColor = pieceColor;
        }
    }

    // draw functions

    getBoardElement() {
        return this.root.getElementById("board");
    }
    removeBoard() {
        const board = this.getBoardElement();

        if(board) {
            board.remove();
        }

        this.fields = [];
        return this;
    }
    createBoard() {
        const $ = this.root.app;

        {
            const board = document.createElement("div"),
                fields =  this.fields;
            board.id = "board";
            board.classList.add("board");
            $.appendChild(board);

            const tiles = Chess.getTilesLayout();
            tiles.forEach(rowArr => {
                const row = document.createElement("div"),
                    fieldsRow = [];

                row.classList.add("board-row");
                rowArr.forEach(tileProps => {
                    const tile = document.createElement("div");
                    tile.classList.add("board-tile");
                    tile.classList.add(tileProps.color);
                    tile.dataset.coordinates = tileProps.coordinates;
                    tile.innerHTML = `<div class='board-tile-content'></div>`;
                    tile.content = tile.firstChild;
                    row.appendChild(tile);
                    fieldsRow.push(tile);
                })

                fields.push(fieldsRow);

                board.appendChild(row);
            })

        }


        this.rotateBoard();

        return this;
    }
    rotateBoard(color = "white") {
        const board = this.getBoardElement();
        board.dataset.rotation = color;
        return this;
    }

    // events

    on = {
        dragstart: e => {
            const coords = this.drag.getDraggablePieceCoords(e.target);
            if(coords) {
                
                this.drag.selectedPiece = e.target.closest(".piece");

                e.dataTransfer.setData("text/plain", coords);
            }
        },
        dragover: e => {
            
            this.drag.checkIfCanDropFromEvent(e);
        },
        dragenter: e => {
            
        },
        dragleave: e => {
            
        },
        dragend: e => {
            this.drag.selectedPiece = null;
        },
        drop: e => {
            e.preventDefault();
            const coords = this.drag.getDroppedTileCoords(e.target),
                coordsFrom = e.dataTransfer.getData("text/plain");      
            if(coords) {
                this.game.move(coordsFrom, coords);
            }   
        },
    }

    drag = {
        selectedPiece: null,
        getDraggablePieceCoords: target => {
            const piece = target.closest(".piece");
            if(!piece) return;

            return this.drag.getBoardTile(piece)
                .dataset
                .coordinates;
        },
        getBoardTile: target => {
            return target.closest(".board-tile");
        },
        getDroppedTileCoords: target => {
            if(this.drag.canDrop(target)) {
                return this.drag.getBoardTile(target)
                    .dataset
                    .coordinates;
            }
            return null;
        },
        canDrop: (target, source = this.drag.selectedPiece) => {
            if(!source) return false;

            const targetTile = this.drag.getBoardTile(target);
            if(!targetTile) return false;

            return true;
        },
        getCoordsFrom: (source = this.drag.selectedPiece) => {
            if(!source) return;
            return this.drag.getBoardTile(source)
                .dataset
                .coordinates;
        },
        checkIfCanDropFromEvent: e => {
            e.dropEffect = "none";
            
            const coords = this.drag.getDroppedTileCoords(e.target),
                coordsFrom = this.drag.getCoordsFrom();  

            if(this.drag.canDrop(e.target) && this.game.canMove(coordsFrom, coords)) {
                e.preventDefault();
                e.dropEffect = "move";
            }
        }
    }

}