import Chess from "./Chess.js";
import { PIECES_ICONS } from "./consts.js";
import { colorToSlovak, coordinatesToXY } from "./functions.js";

/**
 * Trieda UI, ktoré je riadené šachom - `Chess`
 * @module
 */
export default class ChessBoard {
    fields = [];

    infoElm;

    /**
     * @constructor
     * @param {HTMLElement} rootElement Element, v ktorom bude šachovnica
     */
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
                this.addInfo("<b>Víťaz je: " + colorToSlovak(winner) + "! GG</b>");
            } else {
                this.addInfo("<b>Remíza! GG</b>");
            }

            this.addInfoButtons([{
                html: "Hrať odznova",
                onclick: e => {
                    this.startGame();
                }
            }])
            
        });
    }

    /**
     * Začne hru, ak bola hra predtým hraná, vyresetuje
     * @returns {this}
     */
    startGame() {
        this.removeBoard();
        this.createBoard();
        this.game.startGame();
        return this;
    }

    /**
     * Nakreslí do políčka danu figúrku danej farby / vymaže ak null
     * @param {Number} x x súradnica políčka
     * @param {Number} y y súradnica políčka
     * @param {?String} piece názov figúrky
     * @param {?String} pieceColor farba figúrky
     */
    fillField(x, y, piece = null, pieceColor = null) {
        const field = this.fields[x][y].content;
        field.innerHTML = ``;
        if(piece) {
            field.innerHTML = `<div class='piece' draggable="true">${PIECES_ICONS[pieceColor][piece]}</div>`;
            field.dataset.pieceColor = pieceColor;
        }
    }

    // draw functions

    /**
     * Vráti element šachovnice
     * @returns HTMLElement
     */
    getBoardElement() {
        return this.root.getElementById("board");
    }

    /**
     * Vymaže šachovnicu a info
     * @returns {this}
     */
    removeBoard() {
        const board = this.getBoardElement();

        if(board) {
            board.remove();
        }

        
        this.removeInfo();

        this.fields = [];
        return this;
    }

    /**
     * Vytvorí šachovnicu a info element
     * @returns {this}
     */
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

        this.createInfo($);


        this.rotateBoard();

        return this;
    }
    /**
     * Otočí šachovnicu smerom k danej farbe
     * @param {String} color Farba smerom, ku ktorej má otočiť šachovnicu
     * @returns {this}
     */
    rotateBoard(color = "white") {
        const board = this.getBoardElement();
        board.dataset.rotation = color;
        return this;
    }

    /**
     * Zvýrazní všetky políčka kam sa figúrka stojaca na parametre `coordinates` môže pohnúť
     * @param {String} coordinates Reťazec súradnic
     * @returns {this}
     */
    showAllMovablePositions(coordinates) {
        this.hideAllMovablePositions();

        const positions = this.game.getAllMovablePositions(coordinates);
        positions.forEach(v => this.getField(v).classList.add("can-move-on"))

        return this;
    }

    /**
     * Skryje zvýraznenie políčok kam sa fugúrka môže pohnúť
     * @returns {this}
     */
    hideAllMovablePositions() {
        this.removeAllOccurencesOfClass("can-move-on");

        return this;
    }


    /**
     * Vráti element políčko zo súradnicami
     * @param {String} coordinates Reťazec súradníc
     * @returns {HTMLElement} Element políčka
     */
    getField(coordinates) {
        const [x, y] = coordinatesToXY(coordinates);
        return this.fields[x][y];
    }

    /**
     * Odstráni všetky výskyti danej triedy na elemente
     * @param {String} className Názov triedy
     * @returns {this}
     */
    removeAllOccurencesOfClass(className) {
        this.getBoardElement().querySelectorAll(".board-tile." + className).forEach(elm => elm.classList.remove(className));
        return this;
    }

    /**
     * Odstráni info element
     * @returns {this}
     */
    removeInfo() {
        if(!this.infoElm) return false;
        this.infoElm.remove();
        return this;
    }

    /**
     * Vytvorí info element
     * @param {HTMLElement} $ Rodič infa
     * @returns {this}
     */
    createInfo($) {
        const info = document.createElement("div");
        info.classList.add("info");
        this.infoElm = info;
        $.appendChild(info);
        return this;
    }


    /**
     * Pridá do infa riadok
     * @param {String} html Obsah riadku
     * @returns {Boolean}
     */
    addInfo(html) {
        if(!this.infoElm) return false;

        this.infoElm.innerHTML += `<div class='line'>${html}</div>`;

        return true;
    }


    /**
     * Pridá do infa pre každú položku v poli riadok obsahujúci element = položke poľa
     * @param {HTMLElement[]} arr Pole elementov
     * @returns {Boolean}
     */
    addInfoElements(arr) {
        if(!this.infoElm) return false;

        arr.forEach(elm => {
            const line = document.createElement("div");
            line.classList.add("line");
            line.appendChild(elm);
            this.infoElm.appendChild(line);
        })
        return true;
    }

    /**
     * Pridá do infa tlačidlá podľa poľa obsahujúceho dáta o tlačidle
     * @param {Object} arr Objekt obsahujúci dáta o tlačidle
     */
    addInfoButtons(arr) {
        arr = arr.map(btn => {
            const elm = document.createElement("button");
            elm.innerHTML = btn.html;
            elm.addEventListener("click", btn.onclick);
            return elm;
        })
        return this.addInfoElements(arr);
    }

    // events

    /**
     * Obsahuje funkcie na zachytávanie eventov
     */
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

    /**
     * Obsahuje pomocné funkcie po eventoch
     */
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

            if(this.drag.canDrop(e.target) && this.game.canMove(coordsFrom, coords)) {
                e.preventDefault();
                e.dropEffect = "move";
            }
        }
    }

}