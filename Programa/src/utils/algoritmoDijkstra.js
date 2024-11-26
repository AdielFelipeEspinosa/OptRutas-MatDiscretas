export function calcularRutaMasCorta(puntos) {
    const distancias = Array(puntos.length).fill(Infinity);
    const visitados = Array(puntos.length).fill(false);
    distancias[0] = 0;
  
    for (let i = 0; i < puntos.length - 1; i++) {
      const u = minDistancia(distancias, visitados);
      visitados[u] = true;
  
      for (let v = 0; v < puntos.length; v++) {
        const distanciaUV = calcularDistancia(puntos[u], puntos[v]);
        if (!visitados[v] && distanciaUV && distancias[u] + distanciaUV < distancias[v]) {
          distancias[v] = distancias[u] + distanciaUV;
        }
      }
    }
  
    return distancias;
  }
  
  function minDistancia(distancias, visitados) {
    let min = Infinity;
    let minIndex = -1;
  
    for (let v = 0; v < distancias.length; v++) {
      if (!visitados[v] && distancias[v] <= min) {
        min = distancias[v];
        minIndex = v;
      }
    }
    return minIndex;
  }
  
  function calcularDistancia(puntoA, puntoB) {
    const lat1 = puntoA.lat;
    const lng1 = puntoA.lng;
    const lat2 = puntoB.lat;
    const lng2 = puntoB.lng;
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en km
  }
  