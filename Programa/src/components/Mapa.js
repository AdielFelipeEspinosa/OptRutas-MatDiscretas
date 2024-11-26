import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '500px',
};

const Mapa = () => {
  const [puntos, setPuntos] = useState([]);
  const [ubicacion, setUbicacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [directions, setDirections] = useState(null);
  const [distanciaTotal, setDistanciaTotal] = useState(null);
  const [nodos, setNodos] = useState([]);
  const [distanciasNodos, setDistanciasNodos] = useState([]);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyCK0YjQoVSxQjr0ElTnXhWOCDATkWotDrk',
    libraries: ['places', 'maps', 'geometry'],
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUbicacion({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoading(false);
        },
        () => {
          alert('No se pudo obtener la ubicación');
          setLoading(false);
        }
      );
    } else {
      alert('Geolocalización no soportada en este navegador');
      setLoading(false);
    }
  }, []);

  const onMapClick = useCallback((event) => {
    if (puntos.length < 2) {
      const nuevoPunto = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      setPuntos((current) => [...current, nuevoPunto]);
    }
  }, [puntos]);

  const calcularDistancia = (puntoA, puntoB) => {
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
  };

  const calcularRuta = () => {
    if (puntos.length === 2 && ubicacion && isLoaded) {
      const directionsService = new window.google.maps.DirectionsService();
      const origen = puntos[0];
      const destino = puntos[1];

      directionsService.route(
        {
          origin: new window.google.maps.LatLng(origen.lat, origen.lng),
          destination: new window.google.maps.LatLng(destino.lat, destino.lng),
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
            const distancia = result.routes[0].legs[0].distance.value;
            setDistanciaTotal(distancia);

            // Extraer nodos de la ruta
            const nodosRuta = [];
            const distanciasEntreNodos = [];
            const steps = result.routes[0].legs[0].steps;

            steps.forEach((step, index) => {
              const nodoActual = {
                lat: step.start_location.lat(),
                lng: step.start_location.lng(),
              };
              nodosRuta.push(nodoActual);

              if (index > 0) {
                const distanciaNodo = calcularDistancia(nodoActual, nodosRuta[index - 1]);
                distanciasEntreNodos.push(distanciaNodo);
              }
            });

            const lastStep = steps[steps.length - 1];
            const nodoFinal = {
              lat: lastStep.end_location.lat(),
              lng: lastStep.end_location.lng(),
            };
            nodosRuta.push(nodoFinal);
            const distanciaNodoFinal = calcularDistancia(nodoFinal, nodosRuta[nodosRuta.length - 2]);
            distanciasEntreNodos.push(distanciaNodoFinal);

            setNodos(nodosRuta);
            setDistanciasNodos(distanciasEntreNodos);
          } else {
            console.error(`Error al calcular la ruta: ${status}`);
          }
        }
      );
    }
  };

  const limpiarPuntos = () => {
    setPuntos([]);
    setDirections(null);
    setDistanciaTotal(null);
    setNodos([]);
    setDistanciasNodos([]);
  };

  if (loading || !isLoaded) {
    return <div>Cargando...</div>;
  }

  if (loadError) {
    return <div>Error al cargar el mapa.</div>;
  }

  return (
    <>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={ubicacion || { lat: 40.7128, lng: -74.0060 }}
        zoom={15}
        onClick={onMapClick}
      >
        {ubicacion && <Marker position={ubicacion} label="Ubicación actual" />}
        {puntos.map((punto, index) => (
          <Marker key={index} position={punto} label={`Punto ${index + 1}`} />
        ))}
        {directions && (
          <DirectionsRenderer directions={directions} />
        )}
        {nodos.map((nodo, index) => (
          <Marker
            key={index + puntos.length}
            position={nodo}
            label={`Nodo ${index + 1}`}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
          />
        ))}
      </GoogleMap>

      <button onClick={calcularRuta} disabled={puntos.length < 2 || !ubicacion}>
        Calcular Ruta
      </button>
      <button onClick={limpiarPuntos}>
        Limpiar Puntos
      </button>

      {distanciaTotal !== null && (
        <div>
          <strong>Distancia total de la ruta: </strong>
          {(distanciaTotal / 1000).toFixed(2)} km
        </div>
      )}

      {/* Tabla de nodos con distancias */}
      {nodos.length > 0 && (
        <table border="1" style={{ marginTop: '20px', width: '100%', textAlign: 'left' }}>
          <thead>
            <tr>
              <th># Nodo</th>
              <th>Distancia al siguiente nodo (km)</th>
            </tr>
          </thead>
          <tbody>
            {nodos.map((nodo, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{distanciasNodos[index] ? distanciasNodos[index].toFixed(2) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

export default Mapa;
