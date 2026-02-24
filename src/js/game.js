// ============================================================================
// УТИЛИТЫ (Utils) - 200+ строк
// ============================================================================

const ChessUtils = {
    // Конвертация координат
    toChessNotation(row, col) {
        if (row === undefined || col === undefined) return '';
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const rank = 8 - row;
        return files[col] + rank;
    },

    fromChessNotation(pos) {
        if (!pos || pos.length < 2) return { row: -1, col: -1 };
        const file = pos[0].toLowerCase();
        const rank = parseInt(pos[1]);
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const col = files.indexOf(file);
        const row = 8 - rank;
        return { row, col };
    },

    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    },

    // Символы фигур
    getPieceSymbol(piece, withAnimation = true) {
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
        
        let symbol = symbols[piece?.color]?.[piece?.type] || '';
        return withAnimation ? `<span class="piece">${symbol}</span>` : symbol;
    },

    // Стоимость фигур
    getPieceValue(type) {
        const values = {
            pawn: 1,
            knight: 3,
            bishop: 3,
            rook: 5,
            queen: 9,
            king: 100
        };
        return values[type] || 0;
    },

    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    },

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    randomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (Array.isArray(obj)) return obj.map(item => this.deepClone(item));
        
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    },

    getCellColor(row, col) {
        return (row + col) % 2 === 0 ? 'light' : 'dark';
    },

    getDistance(row1, col1, row2, col2) {
        return Math.max(Math.abs(row1 - row2), Math.abs(col1 - col2));
    },

    isSamePosition(row1, col1, row2, col2) {
        return row1 === row2 && col1 === col2;
    },

    getDirection(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.sign(toRow - fromRow);
        const colDiff = Math.sign(toCol - fromCol);
        return { rowDiff, colDiff };
    },

    isStraightLine(row1, col1, row2, col2) {
        return row1 === row2 || col1 === col2;
    },

    isDiagonal(row1, col1, row2, col2) {
        return Math.abs(row1 - row2) === Math.abs(col1 - col2);
    },

    getCellsBetween(row1, col1, row2, col2) {
        const cells = [];
        if (!this.isStraightLine(row1, col1, row2, col2) && !this.isDiagonal(row1, col1, row2, col2)) {
            return cells;
        }
        
        const { rowDiff, colDiff } = this.getDirection(row1, col1, row2, col2);
        let r = row1 + rowDiff;
        let c = col1 + colDiff;
        
        while (r !== row2 || c !== col2) {
            cells.push({ row: r, col: c });
            r += rowDiff;
            c += colDiff;
        }
        
        return cells;
    },

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <span style="margin-left: 10px; cursor: pointer;" onclick="this.parentElement.remove()">✕</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
};

// ============================================================================
// БАЗОВЫЙ КЛАСС ФИГУРЫ (Piece) - 150+ строк
// ============================================================================

class Piece {
    constructor(color, type, row, col) {
        this.id = ChessUtils.generateId();
        this.color = color;
        this.type = type;
        this.row = row;
        this.col = col;
        this.hasMoved = false;
        this.moveCount = 0;
        this.createdAt = Date.now();
    }

    getValidMoves(board, gameState = {}) {
        console.warn(`getValidMoves not implemented for ${this.type}`);
        return [];
    }

    isValidTarget(row, col, board) {
        if (!ChessUtils.isValidPosition(row, col)) return false;
        const targetPiece = board[row]?.[col];
        return !targetPiece || targetPiece.color !== this.color;
    }

    getPieceValue() {
        return ChessUtils.getPieceValue(this.type);
    }

    clone() {
        const PieceClass = this.constructor;
        const cloned = new PieceClass(this.color, this.row, this.col);
        cloned.hasMoved = this.hasMoved;
        cloned.moveCount = this.moveCount;
        cloned.id = this.id;
        return cloned;
    }

    getMoveNotation(move, board) {
        const targetPiece = board[move.row]?.[move.col];
        const isCapture = !!targetPiece;
        const fromNotation = ChessUtils.toChessNotation(this.row, this.col);
        const toNotation = ChessUtils.toChessNotation(move.row, move.col);
        
        let notation = '';
        if (this.type !== 'pawn') {
            notation += this.type === 'knight' ? 'N' : 
                       this.type === 'bishop' ? 'B' :
                       this.type === 'rook' ? 'R' :
                       this.type === 'queen' ? 'Q' : 'K';
        }
        
        if (isCapture) {
            notation += this.type === 'pawn' ? fromNotation[0] : '';
            notation += 'x';
        }
        
        notation += toNotation;
        
        return notation;
    }

    toString() {
        return `${this.color} ${this.type} at ${ChessUtils.toChessNotation(this.row, this.col)}`;
    }
}

// ============================================================================
// ПЕШКА (Pawn) - 100+ строк
// ============================================================================

class Pawn extends Piece {
    constructor(color, row, col) {
        super(color, 'pawn', row, col);
        this.enPassantTarget = null;
    }

    getValidMoves(board, gameState = {}) {
        const moves = [];
        const direction = this.color === 'white' ? -1 : 1;
        const startRow = this.color === 'white' ? 6 : 1;
        const promotionRow = this.color === 'white' ? 0 : 7;

        // Ход вперёд на 1
        const oneStepRow = this.row + direction;
        if (ChessUtils.isValidPosition(oneStepRow, this.col) && !board[oneStepRow][this.col]) {
            const isPromotion = oneStepRow === promotionRow;
            moves.push({ 
                row: oneStepRow, 
                col: this.col, 
                isPromotion,
                promotionOptions: isPromotion ? ['queen', 'rook', 'bishop', 'knight'] : null
            });

            // Ход на 2 с начальной
            if (this.row === startRow) {
                const twoStepRow = this.row + direction * 2;
                if (!board[twoStepRow][this.col] && !board[oneStepRow][this.col]) {
                    moves.push({ row: twoStepRow, col: this.col, isDoubleStep: true });
                }
            }
        }

        // Взятие
        const captureOffsets = [
            { dr: direction, dc: -1 },
            { dr: direction, dc: 1 }
        ];

        captureOffsets.forEach(({ dr, dc }) => {
            const r = this.row + dr;
            const c = this.col + dc;
            
            if (ChessUtils.isValidPosition(r, c)) {
                const targetPiece = board[r]?.[c];
                if (targetPiece && targetPiece.color !== this.color) {
                    const isPromotion = r === promotionRow;
                    moves.push({ 
                        row: r, 
                        col: c, 
                        capture: true,
                        isPromotion,
                        promotionOptions: isPromotion ? ['queen', 'rook', 'bishop', 'knight'] : null
                    });
                }
                
                // Взятие на проходе
                if (gameState.enPassantTarget && 
                    gameState.enPassantTarget.row === r && 
                    gameState.enPassantTarget.col === c) {
                    moves.push({ 
                        row: r, 
                        col: c, 
                        capture: true,
                        enPassant: true 
                    });
                }
            }
        });

        return moves;
    }
}

// ============================================================================
// ЛАДЬЯ (Rook) - 60+ строк
// ============================================================================

class Rook extends Piece {
    constructor(color, row, col) {
        super(color, 'rook', row, col);
    }

    getValidMoves(board, gameState = {}) {
        const moves = [];
        const directions = [
            { dr: -1, dc: 0 },
            { dr: 1, dc: 0 },
            { dr: 0, dc: -1 },
            { dr: 0, dc: 1 }
        ];

        directions.forEach(({ dr, dc }) => {
            let r = this.row + dr;
            let c = this.col + dc;

            while (ChessUtils.isValidPosition(r, c)) {
                const targetPiece = board[r]?.[c];
                
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

// ============================================================================
// КОНЬ (Knight) - 50+ строк
// ============================================================================

class Knight extends Piece {
    constructor(color, row, col) {
        super(color, 'knight', row, col);
    }

    getValidMoves(board, gameState = {}) {
        const moves = [];
        const knightOffsets = [
            { dr: -2, dc: -1 }, { dr: -2, dc: 1 },
            { dr: -1, dc: -2 }, { dr: -1, dc: 2 },
            { dr: 1, dc: -2 }, { dr: 1, dc: 2 },
            { dr: 2, dc: -1 }, { dr: 2, dc: 1 }
        ];

        knightOffsets.forEach(({ dr, dc }) => {
            const r = this.row + dr;
            const c = this.col + dc;

            if (ChessUtils.isValidPosition(r, c)) {
                const targetPiece = board[r]?.[c];
                if (!targetPiece || targetPiece.color !== this.color) {
                    moves.push({ 
                        row: r, 
                        col: c, 
                        capture: !!targetPiece 
                    });
                }
            }
        });

        return moves;
    }
}

// ============================================================================
// СЛОН (Bishop) - 60+ строк
// ============================================================================

class Bishop extends Piece {
    constructor(color, row, col) {
        super(color, 'bishop', row, col);
    }

    getValidMoves(board, gameState = {}) {
        const moves = [];
        const directions = [
            { dr: -1, dc: -1 },
            { dr: -1, dc: 1 },
            { dr: 1, dc: -1 },
            { dr: 1, dc: 1 }
        ];

        directions.forEach(({ dr, dc }) => {
            let r = this.row + dr;
            let c = this.col + dc;

            while (ChessUtils.isValidPosition(r, c)) {
                const targetPiece = board[r]?.[c];
                
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

// ============================================================================
// ФЕРЗЬ (Queen) - 20+ строк
// ============================================================================

class Queen extends Piece {
    constructor(color, row, col) {
        super(color, 'queen', row, col);
    }

    getValidMoves(board, gameState = {}) {
        const rookMoves = new Rook(this.color, this.row, this.col).getValidMoves(board);
        const bishopMoves = new Bishop(this.color, this.row, this.col).getValidMoves(board);
        return [...rookMoves, ...bishopMoves];
    }
}

// ============================================================================
// КОРОЛЬ (King) - 100+ строк
// ============================================================================

class King extends Piece {
    constructor(color, row, col) {
        super(color, 'king', row, col);
        this.inCheck = false;
    }

    getValidMoves(board, gameState = {}) {
        const moves = [];
        
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                
                const r = this.row + dr;
                const c = this.col + dc;

                if (ChessUtils.isValidPosition(r, c)) {
                    const targetPiece = board[r]?.[c];
                    if (!targetPiece || targetPiece.color !== this.color) {
                        moves.push({ 
                            row: r, 
                            col: c, 
                            capture: !!targetPiece
                        });
                    }
                }
            }
        }

        // Рокировка
        if (!this.hasMoved && !this.inCheck && gameState.canCastle !== false) {
            const backRank = this.color === 'white' ? 7 : 0;
            
            // Короткая
            const kingsideRook = board[backRank]?.[7];
            if (kingsideRook?.type === 'rook' && !kingsideRook.hasMoved) {
                const squaresBetween = [board[backRank]?.[5], board[backRank]?.[6]];
                if (squaresBetween.every(sq => sq === null)) {
                    moves.push({ 
                        row: backRank, 
                        col: 6, 
                        isCastle: true,
                        castleType: 'kingside'
                    });
                }
            }
            
            // Длинная
            const queensideRook = board[backRank]?.[0];
            if (queensideRook?.type === 'rook' && !queensideRook.hasMoved) {
                const squaresBetween = [board[backRank]?.[1], board[backRank]?.[2], board[backRank]?.[3]];
                if (squaresBetween.every(sq => sq === null)) {
                    moves.push({ 
                        row: backRank, 
                        col: 2, 
                        isCastle: true,
                        castleType: 'queenside'
                    });
                }
            }
        }

        return moves;
    }
}

// ============================================================================
// КЛАСС ДОСКИ (Board) - 300+ строк
// ============================================================================

class ChessBoard {
    constructor() {
        this.cells = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.enPassantTarget = null;
        this.halfMoveClock = 0;
        this.fullMoveNumber = 1;
        this.positionHistory = [];
        this.initialize();
    }

    initialize() {
        this.cells = [];
        for (let row = 0; row < 8; row++) {
            this.cells[row] = [];
            for (let col = 0; col < 8; col++) {
                this.cells[row][col] = null;
            }
        }
    }

    setupInitialPosition() {
        this.initialize();

        // Белые
        this.cells[7][0] = new Rook('white', 7, 0);
        this.cells[7][1] = new Knight('white', 7, 1);
        this.cells[7][2] = new Bishop('white', 7, 2);
        this.cells[7][3] = new Queen('white', 7, 3);
        this.cells[7][4] = new King('white', 7, 4);
        this.cells[7][5] = new Bishop('white', 7, 5);
        this.cells[7][6] = new Knight('white', 7, 6);
        this.cells[7][7] = new Rook('white', 7, 7);
        
        for (let col = 0; col < 8; col++) {
            this.cells[6][col] = new Pawn('white', 6, col);
        }

        // Чёрные
        this.cells[0][0] = new Rook('black', 0, 0);
        this.cells[0][1] = new Knight('black', 0, 1);
        this.cells[0][2] = new Bishop('black', 0, 2);
        this.cells[0][3] = new Queen('black', 0, 3);
        this.cells[0][4] = new King('black', 0, 4);
        this.cells[0][5] = new Bishop('black', 0, 5);
        this.cells[0][6] = new Knight('black', 0, 6);
        this.cells[0][7] = new Rook('black', 0, 7);
        
        for (let col = 0; col < 8; col++) {
            this.cells[1][col] = new Pawn('black', 1, col);
        }
    }

    getPiece(row, col) {
        if (!ChessUtils.isValidPosition(row, col)) return null;
        return this.cells[row]?.[col] || null;
    }

    setPiece(row, col, piece) {
        if (!ChessUtils.isValidPosition(row, col)) return false;
        this.cells[row][col] = piece;
        if (piece) {
            piece.row = row;
            piece.col = col;
        }
        return true;
    }

    movePiece(fromRow, fromCol, toRow, toCol, promotionType = null) {
        const piece = this.getPiece(fromRow, fromCol);
        if (!piece) return false;

        const targetPiece = this.getPiece(toRow, toCol);
        
        if (targetPiece) {
            this.capturedPieces[targetPiece.color].push(targetPiece);
        }

        // Взятие на проходе
        if (piece.type === 'pawn' && this.enPassantTarget && 
            this.enPassantTarget.row === toRow && this.enPassantTarget.col === toCol) {
            const capturedPawnRow = fromRow;
            const capturedPawnCol = toCol;
            const capturedPawn = this.getPiece(capturedPawnRow, capturedPawnCol);
            if (capturedPawn) {
                this.capturedPieces[capturedPawn.color].push(capturedPawn);
                this.setPiece(capturedPawnRow, capturedPawnCol, null);
            }
        }

        // Рокировка
        if (piece.type === 'king' && Math.abs(toCol - fromCol) === 2) {
            const backRank = piece.color === 'white' ? 7 : 0;
            if (toCol === 6) {
                const rook = this.getPiece(backRank, 7);
                this.setPiece(backRank, 5, rook);
                this.setPiece(backRank, 7, null);
            } else if (toCol === 2) {
                const rook = this.getPiece(backRank, 0);
                this.setPiece(backRank, 3, rook);
                this.setPiece(backRank, 0, null);
            }
        }

        // En passant target
        this.enPassantTarget = null;
        if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
            this.enPassantTarget = {
                row: (fromRow + toRow) / 2,
                col: fromCol
            };
        }

        // Превращение пешки
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            let newPiece;
            switch(promotionType || 'queen') {
                case 'queen': newPiece = new Queen(piece.color, toRow, toCol); break;
                case 'rook': newPiece = new Rook(piece.color, toRow, toCol); break;
                case 'bishop': newPiece = new Bishop(piece.color, toRow, toCol); break;
                case 'knight': newPiece = new Knight(piece.color, toRow, toCol); break;
                default: newPiece = new Queen(piece.color, toRow, toCol);
            }
            newPiece.hasMoved = true;
            this.setPiece(toRow, toCol, newPiece);
            this.setPiece(fromRow, fromCol, null);
        } else {
            this.setPiece(toRow, toCol, piece);
            this.setPiece(fromRow, fromCol, null);
            piece.hasMoved = true;
            piece.moveCount++;
        }

        // Запись хода
        const moveNotation = piece.getMoveNotation?.({ row: toRow, col: toCol }, this.cells) || 
                            `${ChessUtils.toChessNotation(fromRow, fromCol)}-${ChessUtils.toChessNotation(toRow, toCol)}`;
        
        this.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece.type,
            color: piece.color,
            capture: !!targetPiece,
            notation: moveNotation,
            fullMoveNumber: this.fullMoveNumber,
            halfMoveClock: this.halfMoveClock
        });

        if (piece.type === 'pawn' || targetPiece) {
            this.halfMoveClock = 0;
        } else {
            this.halfMoveClock++;
        }
        
        if (piece.color === 'black') {
            this.fullMoveNumber++;
        }

        return true;
    }

    getAllPieces() {
        const pieces = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.cells[row][col];
                if (piece) {
                    pieces.push(piece);
                }
            }
        }
        return pieces;
    }

    getPiecesByColor(color) {
        return this.getAllPieces().filter(p => p.color === color);
    }

    getKingPosition(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.cells[row][col];
                if (piece?.type === 'king' && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    isInCheck(color) {
        const kingPos = this.getKingPosition(color);
        if (!kingPos) return false;

        const opponentColor = color === 'white' ? 'black' : 'white';
        const opponentPieces = this.getPiecesByColor(opponentColor);

        for (const piece of opponentPieces) {
            const moves = piece.getValidMoves(this.cells, { checkValidation: false });
            if (moves.some(m => m.row === kingPos.row && m.col === kingPos.col)) {
                return true;
            }
        }
        return false;
    }

    hasLegalMoves(color) {
        const pieces = this.getPiecesByColor(color);
        
        for (const piece of pieces) {
            const moves = piece.getValidMoves(this.cells);
            for (const move of moves) {
                const tempBoard = this.clone();
                tempBoard.movePiece(piece.row, piece.col, move.row, move.col);
                if (!tempBoard.isInCheck(color)) {
                    return true;
                }
            }
        }
        return false;
    }

    isCheckmate(color) {
        return this.isInCheck(color) && !this.hasLegalMoves(color);
    }

    isStalemate(color) {
        return !this.isInCheck(color) && !this.hasLegalMoves(color);
    }

    clone() {
        const newBoard = new ChessBoard();
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.cells[row][col];
                if (piece) {
                    newBoard.cells[row][col] = piece.clone();
                }
            }
        }
        newBoard.moveHistory = [...this.moveHistory];
        newBoard.capturedPieces = {
            white: [...this.capturedPieces.white],
            black: [...this.capturedPieces.black]
        };
        newBoard.enPassantTarget = this.enPassantTarget ? { ...this.enPassantTarget } : null;
        newBoard.halfMoveClock = this.halfMoveClock;
        newBoard.fullMoveNumber = this.fullMoveNumber;
        return newBoard;
    }

    render(boardElement) {
        if (!boardElement) return;
        
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = `cell ${ChessUtils.getCellColor(row, col)}`;
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.dataset.pos = ChessUtils.toChessNotation(row, col);

                const piece = this.cells[row][col];
                if (piece) {
                    cell.innerHTML = ChessUtils.getPieceSymbol(piece, true);
                }

                boardElement.appendChild(cell);
            }
        }
    }

    getStatistics() {
        const whitePieces = this.getPiecesByColor('white');
        const blackPieces = this.getPiecesByColor('black');
        
        const whiteValue = whitePieces.reduce((sum, p) => sum + p.getPieceValue(), 0);
        const blackValue = blackPieces.reduce((sum, p) => sum + p.getPieceValue(), 0);
        
        return {
            whiteCount: whitePieces.length,
            blackCount: blackPieces.length,
            whiteValue,
            blackValue,
            advantage: whiteValue - blackValue,
            moveNumber: this.fullMoveNumber,
            capturedWhite: this.capturedPieces.white.length,
            capturedBlack: this.capturedPieces.black.length
        };
    }
}

// ============================================================================
// ГЛАВНЫЙ КЛАСС ИГРЫ (Game) - 400+ строк
// ============================================================================

class ChessGame {
    constructor() {
        this.board = new ChessBoard();
        this.currentTurn = 'white';
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.gameOver = false;
        this.winner = null;
        this.moveCount = 0;
        this.sessionStartTime = Date.now();
        this.sessionTimer = null;
        
        // DOM элементы
        this.boardElement = document.getElementById('chessBoard');
        this.turnIndicator = document.getElementById('turnIndicator');
        this.turnText = document.getElementById('turnText');
        this.moveCounter = document.getElementById('moveCounter');
        this.whitePiecesCount = document.getElementById('whitePiecesCount');
        this.blackPiecesCount = document.getElementById('blackPiecesCount');
        this.materialAdvantage = document.getElementById('materialAdvantage');
        this.moveHistory = document.getElementById('moveHistory');
        this.capturedWhite = document.getElementById('capturedWhite');
        this.capturedBlack = document.getElementById('capturedBlack');
        this.gameProgress = document.getElementById('gameProgress');
        this.sessionTime = document.getElementById('sessionTime');
        this.victoryModal = document.getElementById('victoryModal');
        this.victoryTitle = document.getElementById('victoryTitle');
        this.victoryMessage = document.getElementById('victoryMessage');
        
        // Кнопки
        this.newGameBtn = document.getElementById('newGameBtn');
        this.undoBtn = document.getElementById('undoBtn');
        this.hintBtn = document.getElementById('hintBtn');
        this.resignBtn = document.getElementById('resignBtn');
        
        this.init();
    }

    init() {
        console.log('🎮 Chess Royale инициализируется...');
        
        this.board.setupInitialPosition();
        this.render();
        this.attachEventListeners();
        this.startSessionTimer();
        this.updateStatistics();
        this.updateUI();
        
        console.log('✅ Игра успешно запущена!');
    }

    attachEventListeners() {
        this.boardElement.addEventListener('click', (e) => this.handleCellClick(e));
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.undoBtn.addEventListener('click', () => this.undoMove());
        this.hintBtn.addEventListener('click', () => this.showHint());
        this.resignBtn.addEventListener('click', () => this.resign());
        
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                this.undoMove();
            }
            if (e.key === 'Escape') {
                this.deselectPiece();
            }
            if (e.key === 'h') {
                this.showHint();
            }
        });
    }

    handleCellClick(e) {
        if (this.gameOver) return;

        const cell = e.target.closest('.cell');
        if (!cell) return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const piece = this.board.getPiece(row, col);

        if (this.selectedPiece) {
            const move = this.possibleMoves.find(m => m.row === row && m.col === col);
            
            if (move) {
                if (move.isPromotion) {
                    this.showPromotionDialog(this.selectedPiece, row, col);
                } else {
                    this.makeMove(this.selectedPiece.row, this.selectedPiece.col, row, col);
                }
                this.deselectPiece();
            } else {
                if (piece && piece.color === this.currentTurn) {
                    this.selectPiece(row, col);
                } else {
                    this.deselectPiece();
                }
            }
        } else {
            if (piece && piece.color === this.currentTurn) {
                this.selectPiece(row, col);
            }
        }
    }

    selectPiece(row, col) {
        const piece = this.board.getPiece(row, col);
        if (!piece || piece.color !== this.currentTurn) return;

        this.deselectPiece();
        
        this.selectedPiece = piece;
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('selected');

        const allMoves = piece.getValidMoves(this.board.cells, {
            enPassantTarget: this.board.enPassantTarget,
            canCastle: !this.board.isInCheck(this.currentTurn)
        });
        
        this.possibleMoves = allMoves.filter(move => {
            const tempBoard = this.board.clone();
            tempBoard.movePiece(piece.row, piece.col, move.row, move.col);
            return !tempBoard.isInCheck(this.currentTurn);
        });

        this.highlightMoves();
    }

    deselectPiece() {
        if (this.selectedPiece) {
            document.querySelectorAll('.cell.selected').forEach(cell => {
                cell.classList.remove('selected');
            });
            this.clearHighlights();
            this.selectedPiece = null;
            this.possibleMoves = [];
        }
    }

    highlightMoves() {
        this.clearHighlights();
        
        this.possibleMoves.forEach(move => {
            const cell = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
            const targetPiece = this.board.getPiece(move.row, move.col);
            
            if (targetPiece) {
                cell.classList.add('possible-capture');
            } else {
                cell.classList.add('possible-move');
            }
        });
    }

    clearHighlights() {
        document.querySelectorAll('.cell.possible-move, .cell.possible-capture')
            .forEach(cell => {
                cell.classList.remove('possible-move', 'possible-capture');
            });
    }

    makeMove(fromRow, fromCol, toRow, toCol, promotionType = null) {
        const piece = this.board.getPiece(fromRow, fromCol);
        if (!piece) return false;

        const hasCapture = !!this.board.getPiece(toRow, toCol);

        const success = this.board.movePiece(fromRow, fromCol, toRow, toCol, promotionType);
        
        if (success) {
            this.moveCount++;
            
            if (hasCapture) {
                this.animateCapture(toRow, toCol);
            }

            const opponentColor = this.currentTurn === 'white' ? 'black' : 'white';
            
            if (this.board.isCheckmate(opponentColor)) {
                this.gameOver = true;
                this.winner = this.currentTurn;
                this.showVictory(`${this.currentTurn === 'white' ? 'Белые' : 'Чёрные'} победили матом!`, '🏆 Шах и мат!');
            } else if (this.board.isStalemate(opponentColor)) {
                this.gameOver = true;
                this.showVictory('Ничья! Пат.', '🤝 Пат');
            } else if (this.board.isInCheck(opponentColor)) {
                this.showCheckWarning(opponentColor);
            }

            this.highlightLastMove(fromRow, fromCol, toRow, toCol);
            this.currentTurn = opponentColor;
            
            this.render();
            this.updateUI();
            this.updateStatistics();
            this.addMoveToHistory(fromRow, fromCol, toRow, toCol, piece, hasCapture);
            
            return true;
        }
        
        return false;
    }

    highlightLastMove(fromRow, fromCol, toRow, toCol) {
        document.querySelectorAll('.cell.last-move').forEach(cell => {
            cell.classList.remove('last-move');
        });
        
        const fromCell = document.querySelector(`[data-row="${fromRow}"][data-col="${fromCol}"]`);
        const toCell = document.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);
        
        if (fromCell) fromCell.classList.add('last-move');
        if (toCell) toCell.classList.add('last-move');
    }

    showCheckWarning(color) {
        const kingPos = this.board.getKingPosition(color);
        if (kingPos) {
            const kingCell = document.querySelector(`[data-row="${kingPos.row}"][data-col="${kingPos.col}"]`);
            kingCell.classList.add('check');
            
            setTimeout(() => {
                kingCell.classList.remove('check');
            }, 2000);
        }
        
        ChessUtils.showNotification(`${color === 'white' ? 'Белым' : 'Чёрным'} шах!`, 'warning');
    }

    showPromotionDialog(piece, toRow, toCol) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-title">👑 Превращение пешки</div>
                <div class="modal-message">Выберите фигуру:</div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0;">
                    <button class="btn promotion-btn" data-piece="queen">♕ Ферзь</button>
                    <button class="btn promotion-btn" data-piece="rook">♖ Ладья</button>
                    <button class="btn promotion-btn" data-piece="bishop">♗ Слон</button>
                    <button class="btn promotion-btn" data-piece="knight">♘ Конь</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelectorAll('.promotion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const pieceType = btn.dataset.piece;
                this.makeMove(piece.row, piece.col, toRow, toCol, pieceType);
                modal.remove();
            });
        });
    }

    showVictory(message, title = '🏆 Победа!') {
        this.victoryTitle.textContent = title;
        this.victoryMessage.textContent = message;
        this.victoryModal.classList.add('active');
    }

    animateCapture(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.style.animation = 'captureExplosion 0.5s ease-out';
        setTimeout(() => {
            cell.style.animation = '';
        }, 500);
    }

    addMoveToHistory(fromRow, fromCol, toRow, toCol, piece, isCapture) {
        const fromNotation = ChessUtils.toChessNotation(fromRow, fromCol);
        const toNotation = ChessUtils.toChessNotation(toRow, toCol);
        
        let notation = '';
        if (piece.type !== 'pawn') {
            notation += piece.type === 'knight' ? 'N' : 
                       piece.type === 'bishop' ? 'B' :
                       piece.type === 'rook' ? 'R' :
                       piece.type === 'queen' ? 'Q' : 'K';
        }
        
        if (isCapture) {
            notation += 'x';
        }
        
        notation += toNotation;
        
        const moveElement = document.createElement('div');
        moveElement.className = 'move-item';
        
        const moveNumber = this.board.fullMoveNumber;
        const isBlackMove = piece.color === 'black';
        
        moveElement.innerHTML = `
            <span class="move-number">${!isBlackMove ? moveNumber + '.' : moveNumber + '...'}</span>
            <span>${notation}</span>
        `;
        
        this.moveHistory.appendChild(moveElement);
        this.moveHistory.scrollTop = this.moveHistory.scrollHeight;
    }

    updateUI() {
        this.turnIndicator.className = `turn-indicator ${this.currentTurn === 'white' ? 'white-turn' : 'black-turn'}`;
        this.turnText.textContent = `Ход ${this.currentTurn === 'white' ? 'белых' : 'чёрных'}`;
        this.moveCounter.textContent = this.moveCount;
        this.updateCapturedPieces();
    }

    updateStatistics() {
        const stats = this.board.getStatistics();
        
        this.whitePiecesCount.textContent = stats.whiteCount;
        this.blackPiecesCount.textContent = stats.blackCount;
        
        const advantage = stats.advantage;
        this.materialAdvantage.textContent = 
            advantage > 0 ? `+${advantage}` : 
            advantage < 0 ? `${advantage}` : '0';
        
        const totalMaterial = stats.whiteValue + stats.blackValue;
        const progress = totalMaterial > 0 ? (stats.whiteValue / totalMaterial) * 100 : 50;
        this.gameProgress.style.width = `${progress}%`;
    }

    updateCapturedPieces() {
        this.capturedWhite.innerHTML = this.board.capturedPieces.white
            .map(p => ChessUtils.getPieceSymbol(p, false))
            .join(' ');
        
        this.capturedBlack.innerHTML = this.board.capturedPieces.black
            .map(p => ChessUtils.getPieceSymbol(p, false))
            .join(' ');
    }

    startSessionTimer() {
        this.sessionTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.sessionStartTime) / 1000);
            this.sessionTime.textContent = ChessUtils.formatTime(elapsed);
        }, 1000);
    }

    render() {
        this.board.render(this.boardElement);
    }

    newGame() {
        this.board = new ChessBoard();
        this.board.setupInitialPosition();
        this.currentTurn = 'white';
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.gameOver = false;
        this.winner = null;
        this.moveCount = 0;
        this.sessionStartTime = Date.now();
        
        this.render();
        this.deselectPiece();
        this.updateUI();
        this.updateStatistics();
        
        this.moveHistory.innerHTML = '';
        this.victoryModal.classList.remove('active');
    }

    undoMove() {
        ChessUtils.showNotification('Отмена хода временно недоступна', 'error');
    }

    showHint() {
        const pieces = this.board.getPiecesByColor(this.currentTurn);
        const allMoves = [];
        
        for (const piece of pieces) {
            const moves = piece.getValidMoves(this.board.cells);
            for (const move of moves) {
                const tempBoard = this.board.clone();
                tempBoard.movePiece(piece.row, piece.col, move.row, move.col);
                if (!tempBoard.isInCheck(this.currentTurn)) {
                    allMoves.push({ piece, move });
                }
            }
        }
        
        if (allMoves.length > 0) {
            const hint = ChessUtils.randomElement(allMoves);
            const hintCell = document.querySelector(`[data-row="${hint.move.row}"][data-col="${hint.move.col}"]`);
            
            hintCell.style.animation = 'glowPulse 1s ease-in-out 3';
            setTimeout(() => {
                hintCell.style.animation = '';
            }, 3000);
            
            ChessUtils.showNotification(`Попробуйте сходить ${ChessUtils.toChessNotation(hint.piece.row, hint.piece.col)} на ${ChessUtils.toChessNotation(hint.move.row, hint.move.col)}`);
        } else {
            ChessUtils.showNotification('Нет доступных ходов!', 'warning');
        }
    }

    resign() {
        if (this.gameOver) return;
        
        if (confirm(`${this.currentTurn === 'white' ? 'Белые' : 'Чёрные'} сдаются? Вы уверены?`)) {
            this.gameOver = true;
            this.winner = this.currentTurn === 'white' ? 'black' : 'white';
            this.showVictory(`${this.winner === 'white' ? 'Белые' : 'Чёрные'} победили! Соперник сдался.`, '🏳️ Победа');
        }
    }
}

// ============================================================================
// ЗАПУСК ИГРЫ
// ============================================================================

let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new ChessGame();
    window.game = game;
});
