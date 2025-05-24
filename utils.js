/**
 * Registra y muestra información detallada sobre el camino calculado
 * @param {Array} path - Array de posiciones {x, y} que representan el camino
 */
export function logDistance(path) {
    // Verificación de entrada: si no hay camino o está vacío, termina la función
    if (!path || path.length === 0) return;
  
    // Variables para calcular y almacenar información del camino
    let segmentDistance = 0;  // Acumula la distancia total del camino
    let pathDetails = "";     // Almacena la representación textual del camino
    
    // Recorre cada segmento del camino (comenzando desde el segundo punto)
    for (let i = 1; i < path.length; i++) {
      // Calcula la diferencia en coordenadas entre el punto actual y el anterior
      const dx = path[i].x - path[i-1].x;
      const dy = path[i].y - path[i-1].y;
      
      // Acumula la distancia euclidiana entre estos dos puntos
      segmentDistance += Math.hypot(dx, dy);
      
      // Construye la representación textual del camino
      if (i > 1) pathDetails += " → ";  // Agrega separador después del primer punto
      pathDetails += `(${path[i].x},${path[i].y})`;  // Agrega coordenadas actuales
    }
  
    // Actualiza los elementos de la UI con la información calculada:
    
    // Muestra punto de inicio (primer elemento del array)
    document.getElementById("startPoint").value = `(${path[0].x},${path[0].y})`;
    
    // Muestra punto final (último elemento del array)
    document.getElementById("endPoint").value = `(${path[path.length-1].x},${path[path.length-1].y})`;
    
    // Muestra detalles completos del camino (incluyendo punto inicial)
    document.getElementById("pathDetails").value = `(${path[0].x},${path[0].y})${pathDetails}`;
    
    // Nota: La distancia total no se actualiza aquí para evitar duplicados
    // (se maneja en otra parte del código)
}