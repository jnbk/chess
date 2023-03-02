import ChessBoard from "./Chess/ChessBoard.js";

const Elms = {};

window.addEventListener("load", () => {
    Elms.board = document.getElementById("chessRoot");

    const chb = new ChessBoard(Elms.board);
    window.chessBoard = chb;

    chb.startGame();
})

