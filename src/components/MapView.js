import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { createZona } from '../service/zonaService';
import Swal from 'sweetalert2';

const MapView = () => {
  const [geoJsonArray, setGeoJsonArray] = useState([]);


  //Mapa
  useEffect(() => {
    const map = L.map('map').setView([-34.603722, -58.381592], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: false,
    }).addTo(map);

    map.pm.addControls({
      position: 'topleft',
    });

    map.on('pm:create', (e) => {
      const layer = e.layer;
      const geoJSON = layer.toGeoJSON();

      setGeoJsonArray((prevArray) => [...prevArray, geoJSON]);
    });

    return () => {
      map.remove();
    };
  }, []);

  //Create Zona
  const handleCreateZona = async () => {

    const name = await askForName();

    try {
      if (geoJsonArray.length === 0) {
        throw new Error('No se han dibujado geometrías');
      }

      const createdZona = await createZona({
        name,
        features: geoJsonArray,
      });

      console.log('Zona creada:', createdZona);

      Swal.fire({
        icon: 'success',
        title: 'Zona creada',
        text: 'La zona se ha creado exitosamente',
      });

      setGeoJsonArray([]);
    } catch (error) {
      console.error('Error al crear la zona', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Hubo un error al crear la zona',
      });
    }
  };

  const askForName = async () => {
    const { value: name } = await Swal.fire({
      title: 'Ingrese el nombre de la geometría:',
      input: 'text',
      inputLabel: 'Nombre',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'Debe ingresar un nombre';
        }
      },
    });

    return name || 'Geometria sin nombre';
  };

  //Render
  return (
    <div>
      <div id="map" style={{ height: '90vh', width: '100vw' }} />
      <button onClick={handleCreateZona}>Crear Zona</button>
    </div>
  );
};

export default MapView;

