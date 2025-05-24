/**
 * Función principal de dibujo que renderiza todos los elementos del juego
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {Array} snake - Array con los segmentos de la serpiente
 * @param {Object} food - Posición de la comida {x, y}
 * @param {Array} obstacles - Array de obstáculos
 * @param {Array} path - Camino calculado por el pathfinding
 * @param {number} gridSize - Tamaño de cada celda del grid
 */
export function draw(ctx, snake, food, obstacles, path, gridSize) {
  // Limpia el canvas completamente
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Dibuja el camino si existe
  if (path) drawPath(ctx, path, gridSize);

  // Dibuja los obstáculos
  ctx.fillStyle = "#666"; // Color gris para obstáculos
  obstacles.forEach(o => {
    ctx.fillRect(o.x * gridSize, o.y * gridSize, gridSize, gridSize);
  });

  // Dibuja la comida (círculo rojo)
  ctx.fillStyle = "#e74c3c"; // Color rojo
  ctx.beginPath();
  ctx.arc(
    food.x * gridSize + gridSize / 2, // Centro X
    food.y * gridSize + gridSize / 2, // Centro Y
    gridSize / 2 - 2, // Radio (con margen)
    0, Math.PI * 2 // Ángulo completo
  );
  ctx.fill();

  // Dibuja la serpiente segmento por segmento
  snake.forEach((segment, index) => {
    const x = segment.x * gridSize + gridSize / 2;
    const y = segment.y * gridSize + gridSize / 2;
    const radius = gridSize / 2 - 1; // Radio con pequeño margen

    if (index === 0) { // Cabeza de la serpiente
      // Forma ovalada de la cabeza
      ctx.fillStyle = "#8e44ad"; // Color morado
      ctx.beginPath();
      ctx.ellipse(x, y, radius * 1.2, radius * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Ojos blancos
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(x - radius * 0.4, y - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
      ctx.arc(x + radius * 0.4, y - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
      ctx.fill();
      
      // Pupilas negras
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(x - radius * 0.4, y - radius * 0.3, radius * 0.1, 0, Math.PI * 2);
      ctx.arc(x + radius * 0.4, y - radius * 0.3, radius * 0.1, 0, Math.PI * 2);
      ctx.fill();
    } else { // Segmentos del cuerpo
      // Alterna colores para efecto visual
      ctx.fillStyle = index % 2 === 0 ? "#2980b9" : "#3498db";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Efecto de escamas
      ctx.strokeStyle = "#1a5276";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.7, 0, Math.PI * 1.5, true);
      ctx.stroke();
    }
  });

  // Conecta los segmentos del cuerpo con líneas
  if (snake.length > 1) {
    ctx.strokeStyle = "#2980b9";
    ctx.lineWidth = gridSize / 1.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(
      snake[0].x * gridSize + gridSize / 2,
      snake[0].y * gridSize + gridSize / 2
    );
    for (let i = 1; i < snake.length; i++) {
      ctx.lineTo(
        snake[i].x * gridSize + gridSize / 2,
        snake[i].y * gridSize + gridSize / 2
      );
    }
    ctx.stroke();
  }
}

/**
 * Dibuja el camino calculado por el pathfinding
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {Array} path - Array de posiciones del camino
 * @param {number} gridSize - Tamaño de cada celda
 */
function drawPath(ctx, path, gridSize) {
  if (!path || path.length === 0) return;
  
  // Configuración de estilo para la línea del camino
  ctx.strokeStyle = "rgba(255, 165, 0, 0.7)"; // Naranja semitransparente
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(
    path[0].x * gridSize + gridSize / 2,
    path[0].y * gridSize + gridSize / 2
  );
  
  // Dibuja líneas conectando todos los puntos del camino
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(
      path[i].x * gridSize + gridSize / 2,
      path[i].y * gridSize + gridSize / 2
    );
  }
  ctx.stroke();
}