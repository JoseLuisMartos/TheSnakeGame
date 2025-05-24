/**
 * Punto de entrada principal de la aplicación Snake Game
 * 
 * Este archivo configura los elementos de la interfaz de usuario y
 * los pasa al módulo principal del juego cuando el DOM está completamente cargado.
 */

// Importa la función setUIElements del módulo game.js
import { setUIElements } from './game.js';

/**
 * Espera a que el DOM esté completamente cargado antes de inicializar el juego
 * Esto asegura que todos los elementos HTML existan cuando intentemos acceder a ellos
 */
document.addEventListener('DOMContentLoaded', () => {
  // Obtiene referencias a los elementos clave de la interfaz:
  const toggleBtn = document.getElementById("toggleBtn");  // Botón de inicio/pausa
  const resetBtn = document.getElementById("resetBtn");    // Botón de reinicio
  const scoreDisplay = document.getElementById("score");   // Display de puntuación
  const levelDisplay = document.getElementById("level");   // Display de nivel

  // Configura los elementos de UI pasándolos al módulo principal del juego
  setUIElements({
    toggleBtn,        // Botón para iniciar/pausar el juego
    resetBtn,         // Botón para reiniciar el juego
    scoreDisplay,     // Elemento que muestra la puntuación actual
    levelDisplay      // Elemento que muestra el nivel actual
  });
});