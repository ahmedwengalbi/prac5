class Board {
    constructor() {
        this.cells = [];
        this.initialize();
    }

    // Создание пустой доски
    initialize() {
        this.cells = [];
        for (let row = 0; row < 8; row++) {
            this.cells[row] = [];
            for (let col = 0; col < 8; col++) {
                this.cells[row][col] = null;
            }
        }
    }

    // Расстановка фигур в начальную позицию
    setupInitialPosition() {
        this.initialize();

        // Белые фигуры
        this.cells[7][0] = new Rook('white', 7, 0);
        this.cells[7][1] = new Knight('white', 7, 1);
        this.cells[7][2] = new Bishop('white', 7, 2);
        this.cells[7][3] = new Queen('white', 7, 3);
        this.cells[7][4] = new King('white', 7, 4);
        this.cells[7][5] = new Bishop('white', 7, 5);
        this.cells[7][6] = new Knight('white', 7, 6);
        this.cells[7][7] = new Rook('white', 7, 7);
        
        // Белые пешки
        for (let col = 0; col < 8; col++) {
            this.cells[6][col] = new Pawn('white', 6, col);
        }

        // Черные фигуры
        this.cells[0][0] = new Rook('black', 0, 0);
        this.cells[0][1] = new Knight('black', 0, 1);
        this.cells[0][2] = new Bishop('black', 0, 2);
        this.cells[0][3] = new Queen('black', 0, 3);
        this.cells[0][4] = new King('black', 0, 4);
        this.cells[0][5] = new Bishop('black', 0, 5);
        this.cells[0][6] = new Knight('black', 0, 6);
        this.cells[0][7] = new Rook('black', 0, 7);
        
        // Черные пешки
        for (let col = 0; col < 8; col++) {
            this.cells[1][col] = new Pawn('black', 1, col);
        }
    }

    // Получение фигуры по координатам
    getPiece(row, col) {
        if (!Utils.isValidPosition(row, col)) return null;
        return this.cells[row][col];
    }

    // Установка фигуры
    setPiece(row, col, piece) {
        if (!Utils.isValidPosition(row, col)) return false;
        this.cells[row][col] = piece;
        if (piece) {
            piece.row = row;
            piece.col = col;
        }
        return true;
    }

    // Перемещение фигуры
    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPiece(fromRow, fromCol);
        if (!piece) return false;

        // Удаляем фигуру с целевой клетки (взятие)
        // и перемещаем туда нашу фигуру
        this.setPiece(toRow, toCol, piece);
        this.setPiece(fromRow, fromCol, null);
        
        piece.hasMoved = true;
        return true;
    }

    // Отрисовка доски в DOM
    render(boardElement) {
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = `cell ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.dataset.pos = Utils.toChessNotation(row, col);

                const piece = this.cells[row][col];
                if (piece) {
                    cell.textContent = Utils.getPieceSymbol(piece);
                }

                boardElement.appendChild(cell);
            }
        }
    }

    // Клонирование доски (для проверки ходов)
    clone() {
        const newBoard = new Board();
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.cells[row][col];
                if (piece) {
                    newBoard.cells[row][col] = piece.clone();
                } else {
                    newBoard.cells[row][col] = null;
                }
            }
        }
        return newBoard;
    }
}
