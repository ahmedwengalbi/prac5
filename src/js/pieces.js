// Базовый класс фигуры
class Piece {
    constructor(color, type, row, col) {
        this.color = color;
        this.type = type;
        this.row = row;
        this.col = col;
        this.hasMoved = false; // Для пешки и рокировки
    }

    // Базовый метод - будет переопределяться
    getValidMoves(board) {
        return [];
    }

    // Проверка, что клетка пустая или там фигура противника
    isValidTarget(row, col, board) {
        if (!Utils.isValidPosition(row, col)) return false;
        const targetPiece = board[row][col];
        return !targetPiece || targetPiece.color !== this.color;
    }

    // Клонирование фигуры
    clone() {
        const PieceClass = this.constructor;
        const newPiece = new PieceClass(this.color, this.row, this.col);
        newPiece.hasMoved = this.hasMoved;
        return newPiece;
    }
}

// Пешка
class Pawn extends Piece {
    constructor(color, row, col) {
        super(color, 'pawn', row, col);
    }

    getValidMoves(board) {
        const moves = [];
        const direction = this.color === 'white' ? -1 : 1;
        const startRow = this.color === 'white' ? 6 : 1;

        // Ход на 1 клетку вперед
        const oneStepRow = this.row + direction;
        if (Utils.isValidPosition(oneStepRow, this.col) && !board[oneStepRow][this.col]) {
            moves.push({ row: oneStepRow, col: this.col });

            // Ход на 2 клетки с начальной позиции
            const twoStepRow = this.row + direction * 2;
            if (this.row === startRow && !board[twoStepRow][this.col]) {
                moves.push({ row: twoStepRow, col: this.col });
            }
        }

        // Взятие по диагонали
        const captures = [
            { row: this.row + direction, col: this.col - 1 },
            { row: this.row + direction, col: this.col + 1 }
        ];

        captures.forEach(({ row, col }) => {
            if (Utils.isValidPosition(row, col)) {
                const targetPiece = board[row][col];
                if (targetPiece && targetPiece.color !== this.color) {
                    moves.push({ row, col, capture: true });
                }
            }
        });

        return moves;
    }
}

// Ладья
class Rook extends Piece {
    constructor(color, row, col) {
        super(color, 'rook', row, col);
    }

    getValidMoves(board) {
        const moves = [];
        const directions = [
            { dr: -1, dc: 0 }, // вверх
            { dr: 1, dc: 0 },  // вниз
            { dr: 0, dc: -1 }, // влево
            { dr: 0, dc: 1 }   // вправо
        ];

        directions.forEach(({ dr, dc }) => {
            let r = this.row + dr;
            let c = this.col + dc;

            while (Utils.isValidPosition(r, c)) {
                const targetPiece = board[r][c];
                
                if (!targetPiece) {
                    // Пустая клетка
                    moves.push({ row: r, col: c });
                } else {
                    // Если там фигура противника - можно взять
                    if (targetPiece.color !== this.color) {
                        moves.push({ row: r, col: c, capture: true });
                    }
                    break; // Дальше идти нельзя
                }
                
                r += dr;
                c += dc;
            }
        });

        return moves;
    }
}

// Конь
class Knight extends Piece {
    constructor(color, row, col) {
        super(color, 'knight', row, col);
    }

    getValidMoves(board) {
        const moves = [];
        const knightMoves = [
            { dr: -2, dc: -1 }, { dr: -2, dc: 1 },
            { dr: -1, dc: -2 }, { dr: -1, dc: 2 },
            { dr: 1, dc: -2 }, { dr: 1, dc: 2 },
            { dr: 2, dc: -1 }, { dr: 2, dc: 1 }
        ];

        knightMoves.forEach(({ dr, dc }) => {
            const r = this.row + dr;
            const c = this.col + dc;

            if (Utils.isValidPosition(r, c)) {
                const targetPiece = board[r][c];
                if (!targetPiece || targetPiece.color !== this.color) {
                    moves.push({ row: r, col: c, capture: !!targetPiece });
                }
            }
        });

        return moves;
    }
}

// Слон
class Bishop extends Piece {
    constructor(color, row, col) {
        super(color, 'bishop', row, col);
    }

    getValidMoves(board) {
        const moves = [];
        const directions = [
            { dr: -1, dc: -1 }, // вверх-влево
            { dr: -1, dc: 1 },  // вверх-вправо
            { dr: 1, dc: -1 },  // вниз-влево
            { dr: 1, dc: 1 }    // вниз-вправо
        ];

        directions.forEach(({ dr, dc }) => {
            let r = this.row + dr;
            let c = this.col + dc;

            while (Utils.isValidPosition(r, c)) {
                const targetPiece = board[r][c];
                
                if (!targetPiece) {
                    moves.push({ row: r, col: c });
                } else {
                    if (targetPiece.color !== this.color) {
                        moves.push({ row: r, col: c, capture: true });
                    }
                    break;
                }
                
                r += dr;
                c += dc;
            }
        });

        return moves;
    }
}

// Ферзь
class Queen extends Piece {
    constructor(color, row, col) {
        super(color, 'queen', row, col);
    }

    getValidMoves(board) {
        // Ферзь ходит как ладья + слон
        const rookMoves = new Rook(this.color, this.row, this.col).getValidMoves(board);
        const bishopMoves = new Bishop(this.color, this.row, this.col).getValidMoves(board);
        return [...rookMoves, ...bishopMoves];
    }
}

// Король
class King extends Piece {
    constructor(color, row, col) {
        super(color, 'king', row, col);
    }

    getValidMoves(board) {
        const moves = [];
        
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                
                const r = this.row + dr;
                const c = this.col + dc;

                if (Utils.isValidPosition(r, c)) {
                    const targetPiece = board[r][c];
                    if (!targetPiece || targetPiece.color !== this.color) {
                        moves.push({ row: r, col: c, capture: !!targetPiece });
                    }
                }
            }
        }

        return moves;
    }
}
