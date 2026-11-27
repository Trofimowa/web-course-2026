
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const gameOverElement = document.getElementById('game-over');
const restartButton = document.getElementById('restart-button');

const cellSize = 20;
const cellsCount = canvas.width / cellSize;

// Состояние игры
let snake;
let direction;
let nextDirection;
let apple;
let score;
let gameOver;
let turned = false;

// Скорость змейки
const moveInterval = 250;
let lastMoveTime = 0;


// Начало игры
function startGame() {
    snake = [
        { x: 5, y: 10 },
        { x: 4, y: 10 },
        { x: 3, y: 10 }
    ];

    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };

    score = 0;
    gameOver = false;
    turned = false;
    lastMoveTime = 0;

    scoreElement.textContent = score;
    gameOverElement.classList.add('hidden');

    spawnApple();
    draw();
}


// Создание яблока
function spawnApple() {
    do {
        apple = {
            x: Math.floor(Math.random() * cellsCount),
            y: Math.floor(Math.random() * cellsCount)
        };
    } while (
        snake.some(segment =>
            segment.x === apple.x && segment.y === apple.y
        )
    );
}


// Управление змейкой
function changeDirection(event) {
    const directions = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }
    };

    const newDirection = directions[event.key];

    if (!newDirection) return;

    event.preventDefault();

    // Разрешаем только один поворот за ход
    if (turned) return;

    // Запрещаем разворот назад
    if (
        newDirection.x + direction.x === 0 &&
        newDirection.y + direction.y === 0
    ) {
        return;
    }

    nextDirection = newDirection;
    turned = true;
}


// Движение змейки
function moveSnake() {
    direction = nextDirection;
    turned = false;

    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    const ateApple =
        head.x === apple.x && head.y === apple.y;

    if (checkCollision(head, ateApple)) {
        endGame();
        return;
    }

    snake.unshift(head);

    if (ateApple) {
        score++;
        scoreElement.textContent = score;
        spawnApple();
    } else {
        snake.pop();
    }
}


// Проверка столкновений
function checkCollision(head, ateApple) {
    if (
        head.x < 0 ||
        head.x >= cellsCount ||
        head.y < 0 ||
        head.y >= cellsCount
    ) {
        return true;
    }

    const body = ateApple ? snake : snake.slice(0, -1);

    return body.some(segment =>
        segment.x === head.x && segment.y === head.y
    );
}


// Завершение игры
function endGame() {
    gameOver = true;

    finalScoreElement.textContent = score;
    gameOverElement.classList.remove('hidden');
}


// Рисование закруглённого сегмента
function drawSegment(segment, color) {
    ctx.fillStyle = color;
    ctx.beginPath();

    ctx.roundRect(
        segment.x * cellSize + 1,
        segment.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2,
        7
    );

    ctx.fill();
}


// Рисование глаз змейки
function drawEyes() {
    const head = snake[0];

    let eye1;
    let eye2;

    if (direction.x === 1) {
        eye1 = [13, 5];
        eye2 = [13, 14];
    } else if (direction.x === -1) {
        eye1 = [6, 5];
        eye2 = [6, 14];
    } else if (direction.y === -1) {
        eye1 = [5, 6];
        eye2 = [14, 6];
    } else {
        eye1 = [5, 13];
        eye2 = [14, 13];
    }

    [eye1, eye2].forEach(eye => {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(
            head.x * cellSize + eye[0],
            head.y * cellSize + eye[1],
            3,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = '#31543a';
        ctx.beginPath();
        ctx.arc(
            head.x * cellSize + eye[0],
            head.y * cellSize + eye[1],
            1.5,
            0,
            Math.PI * 2
        );
        ctx.fill();
    });
}


// Рисование яблока
function drawApple() {
    const x = apple.x * cellSize + cellSize / 2;
    const y = apple.y * cellSize + cellSize / 2;

    ctx.fillStyle = '#ff777d';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Листочек
    ctx.fillStyle = '#72b66a';
    ctx.beginPath();
    ctx.ellipse(x + 4, y - 9, 4, 2, -0.5, 0, Math.PI * 2);
    ctx.fill();
}


// Отрисовка игры
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Сетка
    ctx.strokeStyle = '#e3edda';
    ctx.lineWidth = 1;

    for (let i = 0; i <= cellsCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
    }

    drawApple();

    // Тело змейки
    snake.forEach((segment, index) => {
        drawSegment(
            segment,
            index === 0 ? '#438c55' : '#83c77e'
        );
    });

    drawEyes();
}


// Обновление состояния игры
function update() {
    if (!gameOver) {
        moveSnake();
    }
}


// Игровой цикл
function gameLoop(currentTime) {
    if (gameOver) return;

    if (currentTime - lastMoveTime >= moveInterval) {
        update();
        draw();

        lastMoveTime = currentTime;
    }

    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}


// Управление клавиатурой
document.addEventListener('keydown', changeDirection);


// Перезапуск игры
restartButton.addEventListener('click', () => {
    startGame();
    requestAnimationFrame(gameLoop);
});


// Запуск
startGame();
requestAnimationFrame(gameLoop);
