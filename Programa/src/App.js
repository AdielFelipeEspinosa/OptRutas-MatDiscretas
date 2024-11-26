// src/App.js
import React from 'react';
import Mapa from './components/Mapa';
import './styles.css';

function App() {
  return (
    <div className="App">
      <h1>Ruta más corta entre dos puntos en Google Maps</h1>
      <Mapa />
    </div>
  );
}

export default App;
