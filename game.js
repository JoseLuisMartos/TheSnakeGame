import { draw } from './renderer.js';
import { bfsPath } from './pathfinding.js';
import { logDistance } from './utils.js';

// Variables globales del juego
let canvas, ctx; // Elementos canvas y contexto de dibujo
let toggleBtn, resetBtn, scoreDisplay, levelDisplay; // Elementos de la UI
let snake = [], food = {}, obstacles = []; // Arrays para serpiente, comida y obstáculos
let score = 0, level = 1; // Puntuación y nivel actual
let currentPath = []; // Camino calculado por el pathfinding
let gameInterval; // Intervalo del juego
let gameState = 'stopped'; // Estados posibles: 'stopped' | 'running' | 'paused'
let stepsSinceLastFood = 0; // Contador de pasos desde última comida
let actualDistance = 0; // Distancia actual recorrida
let totalDistance = 0; // Distancia total acumulada

// Configuración del grid
const GRID_SIZE = 20; // Tamaño de cada celda
let COLS = 0, ROWS = 0; // Columnas y filas del canvas

/**
 * Configura los elementos de la UI e inicializa el juego
 * @param {Object} elements - Objeto con elementos del DOM
 * @param {HTMLElement} elements.toggleBtn - Botón de inicio/pausa
 * @param {HTMLElement} elements.resetBtn - Botón de reinicio
 * @param {HTMLElement} elements.scoreDisplay - Display de puntuación
 * @param {HTMLElement} elements.levelDisplay - Display de nivel
 */
export function setUIElements({ 
  toggleBtn: tBtn, 
  resetBtn: rBtn, 
  scoreDisplay: scoreEl, 
  levelDisplay: levelEl 
}) {
  // Asignación de elementos del DOM
  toggleBtn = tBtn;
  resetBtn = rBtn;
  scoreDisplay = scoreEl;
  levelDisplay = levelEl;

  // Configuración del canvas
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  COLS = canvas.width / GRID_SIZE;
  ROWS = canvas.height / GRID_SIZE;

  // Event listeners
  toggleBtn.addEventListener("click", toggleGame);
  resetBtn.addEventListener("click", resetGame);
  
  // Inicialización del juego
  resetGame();
}

/**
 * Inicializa el estado del juego
 */
function initGame() {
  snake = [{ x: 5, y: 5 }]; // Posición inicial de la serpiente
  generateFood(); // Genera comida aleatoria
  generateObstacles(level * 3); // Genera obstáculos según nivel
  currentPath = []; // Reinicia el camino
  draw(ctx, snake, food, obstacles, currentPath, GRID_SIZE); // Dibuja estado inicial
  clearPathInfo(); // Limpia información del camino
}

/**
 * Actualiza los elementos de la UI
 */
function updateDisplay() {
  scoreDisplay.textContent = score;
  levelDisplay.textContent = level;
  
  // Actualiza el texto del botón según el estado del juego
  if (gameState === 'stopped') {
    toggleBtn.textContent = "▶ Iniciar";
    resetBtn.disabled = true;
  } else if (gameState === 'running') {
    toggleBtn.textContent = "⏸ Pausar";
    resetBtn.disabled = false;
  } else if (gameState === 'paused') {
    toggleBtn.textContent = "▶ Reanudar";
    resetBtn.disabled = false;
  }
}

/**
 * Genera una nueva posición para la comida
 */
function generateFood() {
  let valid = false;
  while (!valid) {
    food = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
    // Verifica que no esté sobre la serpiente u obstáculos
    valid = !snake.some(s => s.x === food.x && s.y === food.y) &&
            !obstacles.some(o => o.x === food.x && o.y === food.y);
  }
}

/**
 * Genera obstáculos aleatorios
 * @param {number} count - Número de obstáculos a generar
 */
function generateObstacles(count) {
  obstacles = [];
  while (obstacles.length < count) {
    const newObs = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
    // Verifica que no esté sobre serpiente, comida u otros obstáculos
    if (!snake.some(s => s.x === newObs.x && s.y === newObs.y) &&
        !obstacles.some(o => o.x === newObs.x && o.y === newObs.y) &&
        (newObs.x !== food.x || newObs.y !== food.y)) {
      obstacles.push(newObs);
    }
  }
}

/**
 * Mueve la serpiente en cada frame del juego
 */
function move() {
  const nextStep = calculateNextStep();
  
  // Verifica si el movimiento es válido
  if (!nextStep || !isValidMove(nextStep)) {
    gameOver();
    return;
  }

  // Calcula distancia del movimiento
  const dx = nextStep.x - snake[0].x;
  const dy = nextStep.y - snake[0].y;
  actualDistance += Math.hypot(dx, dy);
  stepsSinceLastFood++;

  // Realiza el movimiento
  moveSnake(nextStep);

  // Verifica si comió la comida
  if (nextStep.x === food.x && nextStep.y === food.y) {
    handleFoodEaten();
  }

  // Redibuja el juego
  draw(ctx, snake, food, obstacles, currentPath, GRID_SIZE);
}

/**
 * Calcula el próximo movimiento de la serpiente
 * @returns {Object} - Próxima posición {x, y}
 */
function calculateNextStep() {
  // Usa pathfinding para encontrar camino a la comida
  const path = bfsPath(snake[0], food, snake, obstacles, COLS, ROWS);
  currentPath = path || [];

  // Si hay camino, toma el siguiente paso
  if (path && path.length > 1) {
    return path[1];
  }

  // Si no hay camino, busca movimientos seguros
  const safeMoves = getSafeMoves();
  if (safeMoves.length > 0) {
    return selectBestMove(safeMoves);
  }

  return null;
}

/**
 * Obtiene movimientos seguros disponibles
 * @returns {Array} - Array de posiciones seguras {x, y}
 */
function getSafeMoves() {
  const directions = [
    { x: 0, y: -1 }, { x: 0, y: 1 }, // Arriba, abajo
    { x: -1, y: 0 }, { x: 1, y: 0 }, // Izquierda, derecha
  ];
  
  return directions
    .map(dir => ({ x: snake[0].x + dir.x, y: snake[0].y + dir.y }))
    .filter(pos => isValidMove(pos));
}

/**
 * Selecciona el mejor movimiento de los disponibles
 * @param {Array} moves - Movimientos posibles
 * @returns {Object} - Mejor posición {x, y}
 */
function selectBestMove(moves) {
  let bestMove = moves[0];
  let maxSpace = -1;

  // Evalúa cada movimiento por el espacio libre que deja
  for (const move of moves) {
    const tempSnake = [move, ...snake.slice(0, -1)];
    const space = calculateFreeSpace(move, tempSnake);
    
    if (space > maxSpace) {
      maxSpace = space;
      bestMove = move;
    }
  }

  return bestMove;
}

/**
 * Verifica si una posición es válida para moverse
 * @param {Object} pos - Posición {x, y}
 * @param {boolean} ignoreTail - Si ignora la cola de la serpiente
 * @returns {boolean} - True si es válido
 */
function isValidMove(pos, ignoreTail = true) {
  // Fuera de los límites
  if (pos.x < 0 || pos.x >= COLS || pos.y < 0 || pos.y >= ROWS) {
    return false;
  }
  
  // Colisión con el cuerpo
  const bodyToCheck = ignoreTail ? snake.slice(0, -1) : snake;
  if (bodyToCheck.some(s => s.x === pos.x && s.y === pos.y)) {
    return false;
  }
  
  // Colisión con obstáculos
  if (obstacles.some(o => o.x === pos.x && o.y === pos.y)) {
    return false;
  }
  
  return true;
}

/**
 * Calcula el espacio libre alrededor de una posición
 * @param {Object} pos - Posición inicial
 * @param {Array} tempSnake - Serpiente temporal
 * @returns {number} - Cantidad de celdas libres
 */
function calculateFreeSpace(pos, tempSnake) {
  const visited = new Set();
  const queue = [pos];
  visited.add(`${pos.x},${pos.y}`);
  let count = 0;

  // BFS para calcular espacio libre
  while (queue.length > 0) {
    const current = queue.shift();
    count++;
    
    const directions = [
      { x: 0, y: -1 }, { x: 0, y: 1 },
      { x: -1, y: 0 }, { x: 1, y: 0 },
    ];

    for (const dir of directions) {
      const neighbor = { x: current.x + dir.x, y: current.y + dir.y };
      
      if (!visited.has(`${neighbor.x},${neighbor.y}`) &&
          isValidMove(neighbor, false) &&
          !tempSnake.some(s => s.x === neighbor.x && s.y === neighbor.y)) {
        visited.add(`${neighbor.x},${neighbor.y}`);
        queue.push(neighbor);
      }
    }
  }
  
  return count;
}

/**
 * Mueve la serpiente a la nueva posición
 * @param {Object} nextStep - Próxima posición {x, y}
 */
function moveSnake(nextStep) {
  snake.unshift(nextStep);
  // Si no comió, elimina la cola
  if (nextStep.x !== food.x || nextStep.y !== food.y) {
    snake.pop();
  }
}

/**
 * Maneja la lógica cuando la serpiente come
 */
function handleFoodEaten() {
  // Actualiza estadísticas
  totalDistance += actualDistance;
  document.getElementById("pathLength").value = `${stepsSinceLastFood} pasos`;
  document.getElementById("totalDistance").value = `${totalDistance.toFixed(2)} unidades`;
  
  if (currentPath.length > 1) {
    logDistance(currentPath);
  }

  // Actualiza juego
  score++;
  stepsSinceLastFood = 0;
  actualDistance = 0;
  
  // Aumenta nivel cada 5 puntos
  if (score % 5 === 0) {
    level++;
    generateObstacles(level * 3);
  }
  generateFood();
  updateDisplay();
}

/**
 * Maneja el fin del juego
 */
function gameOver() {
  stopGame();
  alert(`¡Juego Terminado! Puntaje: ${score}`);
  resetGame();
}

/**
 * Inicia el juego
 */
function startGame() {
  if (gameState !== 'running') {
    if (gameState === 'stopped') {
      initGame();
    }
    gameInterval = setInterval(move, 150);
    gameState = 'running';
    updateDisplay();
  }
}

/**
 * Pausa el juego
 */
function pauseGame() {
  if (gameState === 'running') {
    clearInterval(gameInterval);
    gameInterval = null;
    gameState = 'paused';
    updateDisplay();
  }
}

/**
 * Reinicia el juego
 */
export function resetGame() {
  stopGame();
  score = 0;
  level = 1;
  stepsSinceLastFood = 0;
  actualDistance = 0;
  totalDistance = 0;
  gameState = 'stopped';
  initGame();
  updateDisplay();
  clearPathInfo();
}

/**
 * Alterna entre pausa/inicio
 */
export function toggleGame() {
  if (gameState === 'running') {
    pauseGame();
  } else {
    startGame();
  }
}

/**
 * Limpia la información del camino
 */
function clearPathInfo() {
  document.getElementById("startPoint").value = "";
  document.getElementById("endPoint").value = "";
  document.getElementById("pathLength").value = "";
  document.getElementById("pathDetails").value = "";
  document.getElementById("totalDistance").value = "";
}

/**
 * Detiene el juego
 */
function stopGame() {
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }
  gameState = 'stopped';
}