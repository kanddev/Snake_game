// Game constants
const BLOCK_SIZE = 25;
const ROWS = 20;
const COLS = 20;
const INITIAL_SPEED = 100;
const SPEED_INCREMENT = 0.5;

// Game variables
let board;
let context;
let gameLoop;
let gameSpeed = INITIAL_SPEED;

// Snake properties
let snakeX = BLOCK_SIZE * 5;
let snakeY = BLOCK_SIZE * 5;
let velocityX = 0;
let velocityY = 0;
let snakeBody = [];

// Food properties
let foodX;
let foodY;

// Game state
let gameOver = false;
let gameStarted = false;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;

// Initialize game
window.onload = function () {
    setupGame();
    setupEventListeners();
    drawInitialBoard();
    updateScoreDisplay();
};

function setupGame() {
    board = document.getElementById("board");
    board.height = ROWS * BLOCK_SIZE;
    board.width = COLS * BLOCK_SIZE;
    context = board.getContext("2d");
}

function setupEventListeners() {
    document.getElementById("startBtn").addEventListener("click", startGame);
    document.getElementById("restartBtn").addEventListener("click", resetGame);
    document.addEventListener("keydown", handleKeyPress);
}

// Game control functions
function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        document.getElementById("startBtn").style.display = "none";
        placeFood();
        gameLoop = setInterval(update, gameSpeed);
    }
}

function resetGame() {
    clearInterval(gameLoop);
    snakeX = BLOCK_SIZE * 5;
    snakeY = BLOCK_SIZE * 5;
    velocityX = 0;
    velocityY = 0;
    snakeBody = [];
    score = 0;
    gameSpeed = INITIAL_SPEED;
    gameOver = false;
    gameStarted = false;

    updateScoreDisplay();
    document.getElementById("restartBtn").style.display = "none";
    document.getElementById("startBtn").style.display = "block";
    drawInitialBoard();
}

// Input handling
function handleKeyPress(e) {
    if (!gameStarted) return;

    // Prevent reverse direction
    switch(e.code) {
        case "ArrowUp":
            if (velocityY !== BLOCK_SIZE) {
                velocityX = 0;
                velocityY = -BLOCK_SIZE;
            }
            break;
        case "ArrowDown":
            if (velocityY !== -BLOCK_SIZE) {
                velocityX = 0;
                velocityY = BLOCK_SIZE;
            }
            break;
        case "ArrowLeft":
            if (velocityX !== BLOCK_SIZE) {
                velocityX = -BLOCK_SIZE;
                velocityY = 0;
            }
            break;
        case "ArrowRight":
            if (velocityX !== -BLOCK_SIZE) {
                velocityX = BLOCK_SIZE;
                velocityY = 0;
            }
            break;
    }
}

// Game logic
function update() {
    if (gameOver) {
        document.getElementById("restartBtn").style.display = "block";
        return;
    }

    drawBoard();
    drawFood();
    moveSnake();
    drawSnake();
    checkCollision();
}

function moveSnake() {
    // Move body
    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = [...snakeBody[i-1]];
    }
    if (snakeBody.length) {
        snakeBody[0] = [snakeX, snakeY];
    }

    // Move head
    snakeX += velocityX;
    snakeY += velocityY;

    if(checkCollision()) {
        gameOverHandler();
        return;
    }
    // Check food collision
    if (snakeX === foodX && snakeY === foodY) {
        snakeBody.push([foodX, foodY]);
        placeFood();
        updateScore();
    }
}

// Drawing functions
function drawBoard() {
    context.fillStyle = "black";
    context.fillRect(0, 0, board.width, board.height);
}

function drawFood() {
    const gradient = context.createRadialGradient(
        foodX + BLOCK_SIZE/2, foodY + BLOCK_SIZE/2, 2,
        foodX + BLOCK_SIZE/2, foodY + BLOCK_SIZE/2, BLOCK_SIZE/2
    );
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(1, '#ee5253');
    
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(
        foodX + BLOCK_SIZE/2, 
        foodY + BLOCK_SIZE/2, 
        BLOCK_SIZE/2, 
        0, 
        2 * Math.PI
    );
    context.fill();
}

function drawSnake() {
    const gradient = context.createLinearGradient(0, 0, board.width, board.height);
    gradient.addColorStop(0, '#4ecca3');
    gradient.addColorStop(1, '#45b999');
    context.fillStyle = gradient;

    // Draw body
    snakeBody.forEach(([x, y]) => {
        context.beginPath();
        context.roundRect(x, y, BLOCK_SIZE, BLOCK_SIZE, 5);
        context.fill();
    });

    // Draw head
    context.beginPath();
    context.roundRect(snakeX, snakeY, BLOCK_SIZE, BLOCK_SIZE, 8);
    context.fill();
}

// Helper functions
function placeFood() {
    foodX = Math.floor(Math.random() * COLS) * BLOCK_SIZE;
    foodY = Math.floor(Math.random() * ROWS) * BLOCK_SIZE;

    // Prevent food from spawning on snake
    while (isFoodOnSnake()) {
        foodX = Math.floor(Math.random() * COLS) * BLOCK_SIZE;
        foodY = Math.floor(Math.random() * ROWS) * BLOCK_SIZE;
    }
}

function isFoodOnSnake() {
    if (foodX === snakeX && foodY === snakeY) return true;
    return snakeBody.some(([x, y]) => x === foodX && y === foodY);
}

function checkCollision() {
    // Wall collision
    if (snakeX < 0 || snakeX >= COLS * BLOCK_SIZE ||
        snakeY < 0 || snakeY >= ROWS * BLOCK_SIZE) {
        return true;
    }

    // Self collision
    for (let segment of snakeBody) {
        if (snakeX === segment[0] && snakeY === segment[1]) {
          return true;
        }
    }
    return false;
}

function updateScore() {
    score += 10;
    gameSpeed = Math.max(50, INITIAL_SPEED - (score * SPEED_INCREMENT));
    clearInterval(gameLoop);
    gameLoop = setInterval(update, gameSpeed);
    
    updateScoreDisplay();
}

function updateScoreDisplay() {
    document.getElementById("score").textContent = score;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
        document.getElementById("highScore").textContent = highScore;
    }
}

function drawInitialBoard() {
    context.fillStyle = "black";
    context.fillRect(0, 0, board.width, board.height);
}

function gameOverHandler() {
    gameOver = true;
    clearInterval(gameLoop);
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }
    document.getElementById("restartBtn").style.display = "block";
}