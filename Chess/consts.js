export const LETTERS = ["a", "b", "c", "d", "e", "f", "g", "h"];

export const KING = "K";
export const QUEEN = "Q";
export const ROOK = "R";
export const BISHOP = "B";
export const KNIGHT = "N";
export const PAWN = "P";

export const START_POSITIONS = {
    "a1": { piece: ROOK, pieceColor: "white"},
    "b1": { piece: KNIGHT, pieceColor: "white"},
    "c1": { piece: BISHOP, pieceColor: "white"},
    "d1": { piece: QUEEN, pieceColor: "white"},
    "e1": { piece: KING, pieceColor: "white"},
    "f1": { piece: BISHOP, pieceColor: "white"},
    "g1": { piece: KNIGHT, pieceColor: "white"},
    "h1": { piece: ROOK, pieceColor: "white"},
    "a2": { piece: PAWN, pieceColor: "white"},
    "b2": { piece: PAWN, pieceColor: "white"},
    "c2": { piece: PAWN, pieceColor: "white"},
    "d2": { piece: PAWN, pieceColor: "white"},
    "e2": { piece: PAWN, pieceColor: "white"},
    "f2": { piece: PAWN, pieceColor: "white"},
    "g2": { piece: PAWN, pieceColor: "white"},
    "h2": { piece: PAWN, pieceColor: "white"},

    "a8": { piece: ROOK, pieceColor: "black"},
    "b8": { piece: KNIGHT, pieceColor: "black"},
    "c8": { piece: BISHOP, pieceColor: "black"},
    "d8": { piece: QUEEN, pieceColor: "black"},
    "e8": { piece: KING, pieceColor: "black"},
    "f8": { piece: BISHOP, pieceColor: "black"},
    "g8": { piece: KNIGHT, pieceColor: "black"},
    "h8": { piece: ROOK, pieceColor: "black"},
    "a7": { piece: PAWN, pieceColor: "black"},
    "b7": { piece: PAWN, pieceColor: "black"},
    "c7": { piece: PAWN, pieceColor: "black"},
    "d7": { piece: PAWN, pieceColor: "black"},
    "e7": { piece: PAWN, pieceColor: "black"},
    "f7": { piece: PAWN, pieceColor: "black"},
    "g7": { piece: PAWN, pieceColor: "black"},
    "h7": { piece: PAWN, pieceColor: "black"},
};

export const PIECES_ICONS = {
    white: {
        "K": "<img src='./Chess/pieces/wk.svg'>",
        "Q": "<img src='./Chess/pieces/wq.svg'>",
        "R": "<img src='./Chess/pieces/wr.svg'>",
        "B": "<img src='./Chess/pieces/wb.svg'>",
        "N": "<img src='./Chess/pieces/wn.svg'>",
        "P": "<img src='./Chess/pieces/wp.svg'>",
    },
    black: {
        "K": "<img src='./Chess/pieces/bk.svg'>",
        "Q": "<img src='./Chess/pieces/bq.svg'>",
        "R": "<img src='./Chess/pieces/br.svg'>",
        "B": "<img src='./Chess/pieces/bb.svg'>",
        "N": "<img src='./Chess/pieces/bn.svg'>",
        "P": "<img src='./Chess/pieces/bp.svg'>",
    },
};