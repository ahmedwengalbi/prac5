class Game {
    constructor() {
        this.board = new Board();
        this.currentTurn = 'white';
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.gameOver = false;

        // DOM элементы
        this.boardElement = document.getElementById('chessBoard');
        this.turnIndicator = document.getElementById('turnIndicator');
        this.newGameBtn = document.getElementById('newGameBtn');

        this.init();
    }

    init() {
        // Расставляем фигуры
        this.board.setupInitialPosition();
        
        // Отрисовываем доску
        this.render();
        
        // Вешаем обработчики событий
        this.boardElement.addEventListener('click', (e) => this.handleCellClick(e));
        this.newGameBtn.addEventListener('click', () => this.resetGame());

        this.updateTurnIndicator();
    }

    render() {
        this.board.render(this.boardElement);
    }

    handleCellClick(e) {
        if (this.gameOver) return;

        // Находим клетку, по которой кликнули
        const cell = e.target.closest('.cell');
        if (!cell) return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const piece = this.board.getPiece(row, col);

        // Если уже выбрана какая-то фигура
        if (this.selectedPiece) {
            // Проверяем, является ли целевая клетка допустимым ходом
            const move = this.possibleMoves.find(m => m.row === row && m.col === col);
            
            if (move) {
                // Делаем ход
                this.movePiece(this.selectedPiece.row, this.selectedPiece.col, row, col);
                this.clearHighlights();
                this.selectedPiece = null;
                this.possibleMoves = [];
            } else {
                // Если кликнули на другую свою фигуру - выбираем её
                if (piece && piece.color === this.currentTurn) {
                    this.selectPiece(row, col);
                } else {
                    // Иначе снимаем выделение
                    this.clearHighlights();
                    this.selectedPiece = null;
                    this.possibleMoves = [];
                }
            }
        } else {
            // Если ничего не выбрано, но кликнули на свою фигуру
            if (piece && piece.color === this.currentTurn) {
                this.selectPiece(row, col);
            }
        }
    }

    selectPiece(row, col) {
        const piece = this.board.getPiece(row, col);
        if (!piece || piece.color !== this.currentTurn) return;

        // Снимаем предыдущее выделение
        this.clearHighlights();

        // Выделяем новую фигуру
        this.selectedPiece = piece;
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('selected');

        // Получаем и подсвечиваем возможные ходы
        this.possibleMoves = piece.getValidMoves(this.board.cells);
        this.highlightMoves();
    }

    highlightMoves() {
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
        document.querySelectorAll('.cell.selected, .cell.possible-move, .cell.possible-capture')
            .forEach(cell => {
                cell.classList.remove('selected', 'possible-move', 'possible-capture');
            });
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        // Перемещаем фигуру
        this.board.movePiece(fromRow, fromCol, toRow, toCol);
        
        // Перерисовываем доску
        this.render();
        
        // Меняем игрока
        this.switchTurn();
    }

    switchTurn() {
        this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
        this.updateTurnIndicator();
        
        // TODO: Проверка на шах/мат
    }

    updateTurnIndicator() {
        this.turnIndicator.textContent = `Ход ${this.currentTurn === 'white' ? 'белых' : 'черных'}`;
    }

    resetGame() {
        this.board.setupInitialPosition();
        this.currentTurn = 'white';
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.gameOver = false;
        
        this.render();
        this.updateTurnIndicator();
        this.clearHighlights();
    }
}

// Запуск игры после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
