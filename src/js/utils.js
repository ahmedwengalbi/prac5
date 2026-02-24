// Конвертация координат
const Utils = {
    // Из индексов [row, col] в шахматную нотацию (a1-h8)
    toChessNotation(row, col) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const rank = 8 - row; // 0 -> 8, 7 -> 1
        return files[col] + rank;
    },

    // Из шахматной нотации в [row, col]
    fromChessNotation(pos) {
        const file = pos[0];
        const rank = parseInt(pos[1]);
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const col = files.indexOf(file);
        const row = 8 - rank;
        return { row, col };
    },

    // Проверка, что координаты в пределах доски
    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    },

    // Unicode символы для фигур
    getPieceSymbol(piece) {
        const symbols = {
            white: {
                king: '♔',
                queen: '♕',
                rook: '♖',
                bishop: '♗',
                knight: '♘',
                pawn: '♙'
            },
            black: {
                king: '♚',
                queen: '♛',
                rook: '♜',
                bishop: '♝',
                knight: '♞',
                pawn: '♟'
            }
        };
        return symbols[piece.color][piece.type];
    }
};
