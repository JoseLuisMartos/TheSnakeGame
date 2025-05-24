// pathfinding.js - Versión final corregida

/**
 * Implementa el algoritmo BFS (Breadth-First Search) para encontrar el camino más corto
 * desde la cabeza de la serpiente hasta la comida.
 * 
 * @param {Object} start - Posición inicial {x, y} de la serpiente
 * @param {Object} target - Posición objetivo (comida) {x, y}
 * @param {Array} snake - Array con los segmentos del cuerpo de la serpiente
 * @param {Array} obstacles - Array con las posiciones de los obstáculos
 * @param {number} COLS - Número de columnas del tablero de juego
 * @param {number} ROWS - Número de filas del tablero de juego
 * @returns {Array|null} - Retorna el camino encontrado como array de posiciones o null si no hay camino
 */
export function bfsPath(start, target, snake, obstacles, COLS, ROWS) {
  // Inicializa una cola (FIFO) con el camino inicial que solo contiene la posición de inicio
  const queue = [[start]];
  
  // Conjunto para llevar registro de las celdas ya visitadas (evita ciclos)
  const visited = new Set();
  
  // Función helper para generar claves únicas de posición (x,y)
  const key = (x, y) => `${x},${y}`;
  
  // Marca la posición inicial como visitada
  visited.add(key(start.x, start.y));

  // Define las 4 direcciones posibles de movimiento (arriba, abajo, izquierda, derecha)
  const directions = [
    { x: 0, y: -1 }, // Arriba
    { x: 0, y: 1 },  // Abajo
    { x: -1, y: 0 }, // Izquierda
    { x: 1, y: 0 },  // Derecha
  ];

  // Bucle principal del BFS: procesa mientras haya caminos por explorar
  while (queue.length > 0) {
    // Extrae el primer camino de la cola (FIFO)
    const path = queue.shift();
    
    // Obtiene la última posición del camino actual (posición actual en la exploración)
    const current = path[path.length - 1];

    // Condición de término: si llegamos al objetivo (comida)
    if (current.x === target.x && current.y === target.y) {
      return path; // Retorna el camino completo encontrado
    }

    // Explora todas las direcciones posibles desde la posición actual
    for (const dir of directions) {
      // Calcula la posición del vecino en la dirección actual
      const neighbor = {
        x: current.x + dir.x,
        y: current.y + dir.y
      };

      // Verifica si el movimiento al vecino es válido
      if (isValidMove(neighbor, snake, obstacles, COLS, ROWS, visited)) {
        // Marca el vecino como visitado
        visited.add(key(neighbor.x, neighbor.y));
        
        // Agrega un nuevo camino a la cola (camino actual + nuevo vecino)
        queue.push([...path, neighbor]);
      }
    }
  }

  // Si se vació la cola sin encontrar el objetivo, retorna null (no hay camino)
  return null;
}

/**
 * Verifica si un movimiento a la posición dada es válido
 * 
 * @param {Object} pos - Posición a verificar {x, y}
 * @param {Array} snake - Cuerpo de la serpiente
 * @param {Array} obstacles - Obstáculos del tablero
 * @param {number} COLS - Número de columnas del tablero
 * @param {number} ROWS - Número de filas del tablero
 * @param {Set} visited - Conjunto de posiciones ya visitadas
 * @returns {boolean} - True si el movimiento es válido, False si no lo es
 */
function isValidMove(pos, snake, obstacles, COLS, ROWS, visited) {
  // Verifica si la posición está fuera de los límites del tablero
  if (pos.x < 0 || pos.x >= COLS || pos.y < 0 || pos.y >= ROWS) {
    return false;
  }
  
  // Verifica si la posición ya fue visitada en la búsqueda actual
  if (visited.has(`${pos.x},${pos.y}`)) {
    return false;
  }
  
  // Verifica colisión con el cuerpo de la serpiente (excepto la cola)
  if (snake.slice(0, -1).some(s => s.x === pos.x && s.y === pos.y)) {
    return false;
  }
  
  // Verifica colisión con obstáculos
  if (obstacles.some(o => o.x === pos.x && o.y === pos.y)) {
    return false;
  }
  
  // Si pasa todas las verificaciones, el movimiento es válido
  return true;
}