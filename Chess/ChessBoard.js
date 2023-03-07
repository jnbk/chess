import Chess from "./Chess.js";
import { PIECES_ICONS } from "./consts.js";
import { colorToSlovak, coordinatesToXY } from "./functions.js";

export default class ChessBoard {
    fields = [];

    infoElm;

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
            root.addEventListener("click", this.on.click);
        }

        const game = this.game = new Chess();
        game.addEventListener("fieldset", e => this.fillField(e.detail.x, e.detail.y, e.detail.piece, e.detail.pieceColor))
        game.addEventListener("turn", e => {
            const color = e.detail.onTurn;
            this.rotateBoard(color)
            this.addInfo("Na ťahu je: " + colorToSlovak(color) + "");
            this.removeAllOccurencesOfClass("check");
        })
        game.addEventListener("check", e => {
            const king = e.detail.king;
            this.getField(king).classList.add("check");
        });
        game.addEventListener("gameover", e => {
            const winner = e.detail.winner;
            if(winner) {
                this.addInfo("Víťaz je: " + colorToSlovak(winner) + "! GG");
            } else {
                this.addInfo("Remíza! GG");
            }
            
        });
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

        if(!this.resetInfo()) {
            const info = document.createElement("div");
            info.classList.add("info");
            this.infoElm = info;
            $.appendChild(info);
        }

        {
            const buttons = [

            ];
        }


        this.rotateBoard();

        return this;
    }
    rotateBoard(color = "white") {
        const board = this.getBoardElement();
        board.dataset.rotation = color;
        return this;
    }

    showAllMovablePositions(coordinates) {
        this.hideAllMovablePositions();

        const positions = this.game.getAllMovablePositions(coordinates);
        positions.forEach(v => this.getField(v).classList.add("can-move-on"))
    }
    hideAllMovablePositions() {
        this.removeAllOccurencesOfClass("can-move-on");
    }


    getField(coordinates) {
        const [x, y] = coordinatesToXY(coordinates);
        return this.fields[x][y];
    }
    removeAllOccurencesOfClass(className) {
        this.getBoardElement().querySelectorAll(".board-tile." + className).forEach(elm => elm.classList.remove(className));
    }

    resetInfo() {
        if(!this.infoElm) return false;

        this.infoElm.innerHTML = "";

        return true;
    }

    addInfo(html) {
        if(!this.infoElm) return false;

        this.infoElm.innerHTML += `<div class='line'>${html}</div>`;

        return true;
    }

    // events

    on = {
        click: e => {
            if(!e.target.closest(".board")) return;

            const coordsDraggable = this.drag.getDraggablePieceCoords(e.target);
            
            if(coordsDraggable && this.drag.selectedPiece === coordsDraggable) {
                this.hideAllMovablePositions();
                this.drag.selectedPiece = null;
            } else if(this.drag.selectedPiece) {
                const coords = this.drag.getDroppedTileCoords(e.target);
                if(coords) {
                    this.game.move(this.drag.getCoordsFrom(), coords);
                }
                this.hideAllMovablePositions();
                this.drag.selectedPiece = null;
                
            } else if(coordsDraggable) {
                this.drag.selectedPiece = e.target.closest(".piece");
                this.showAllMovablePositions(coordsDraggable);
            }
            
            
            
        },
        dragstart: e => {
            if(!e.target.closest(".board")) return;
            const coords = this.drag.getDraggablePieceCoords(e.target);
            
            this.hideAllMovablePositions();
            if(coords) {
                e.dataTransfer.effectAllowed = "copyMove";
                
                this.drag.selectedPiece = e.target.closest(".piece");

                e.dataTransfer.setData("text/plain", coords);
                this.showAllMovablePositions(coords);
            }
        },
        dragover: e => {
            if(!e.target.closest(".board")) return;
            this.drag.checkIfCanDropFromEvent(e);
        },
        dragenter: e => {
            
        },
        dragleave: e => {
            
        },
        dragend: e => {
            this.drag.selectedPiece = null;
            this.hideAllMovablePositions();
        },
        drop: e => {
            if(!e.target.closest(".board")) return;
            e.preventDefault();
            const coords = this.drag.getDroppedTileCoords(e.target),
                coordsFrom = e.dataTransfer.getData("text/plain");      
            if(coords) {
                this.game.move(coordsFrom, coords);
            }   
            
            this.drag.selectedPiece = null;
            this.hideAllMovablePositions();
        },
    }

    drag = {
        selectedPiece: null,
        getDraggablePieceCoords: target => {
            if(!target) return;
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
            const boardTile = this.drag.getBoardTile(source);
            if(!boardTile) return;

            return boardTile.dataset.coordinates;
        },
        checkIfCanDropFromEvent: e => {
            e.dropEffect = "none";
            
            const coords = this.drag.getDroppedTileCoords(e.target),
                coordsFrom = this.drag.getCoordsFrom();  
                
            //this.showAllMovablePositions(coordsFrom);

            if(this.drag.canDrop(e.target) && this.game.canMove(coordsFrom, coords)) {
                e.preventDefault();
                e.dropEffect = "move";
            }
        }
    }

}