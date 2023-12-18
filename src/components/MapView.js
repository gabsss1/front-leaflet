import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { createZona, getAllZonas, getZonaById, updateZona} from '../service/zonaService';
import Swal from 'sweetalert2';

  // Marker Icon fix
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
    iconUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
  });


const MapView = () => {
  const [geoJsonArray, setGeoJsonArray] = useState([]);
  const [map, setMap] = useState(null);

  //Mapa
  useEffect(() => {
    const newMap = L.map('map').setView([-34.603722, -58.381592], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: false,
    }).addTo(newMap);

    newMap.pm.addControls({
      position: 'topleft',
    });

    newMap.on('pm:create', (e) => {
      const layer = e.layer;
      const geoJSON = layer.toGeoJSON();

      setGeoJsonArray((prevArray) => [...prevArray, geoJSON]);
    });

    setMap(newMap);

    return () => {
      newMap.remove();
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

  const handleGetAllZonas = async () => {
    try {
      const geometries = await getAllZonas();
      setGeoJsonArray(geometries);
  
      if (map) {
        addGeometriesToMap(geometries);
      }
    } catch (error) {
      console.error('Error al obtener todas las zonas', error);
    }
  };
  
  const addGeometriesToMap = (geometries) => {
    geometries.forEach((zona) => {
      addToMap(zona);
    });
  };
  
  const addToMap = (zona) => {
    const geometry = zona.geometry;
  
    if (geometry && geometry.type) {
      switch (geometry.type) {
        case 'Polygon':
        case 'LineString':
          L.geoJSON(geometry).addTo(map);
          break;
        case 'GeometryCollection':
          geometry.geometries.forEach((subGeometry) => {
            L.geoJSON(subGeometry).addTo(map);
          });
          break;
        default:
          console.warn('Tipo de geometría no manejado:', geometry.type);
      }
    } else {
      console.warn('Geometría no válida:', zona);
    }
  };

  const handleGetZonaById = async () => {
    try {
      const zonas = await getAllZonas();
  
      const { value: zonaName } = await Swal.fire({
        title: 'Seleccione una Zona',
        input: 'select',
        inputOptions: {
          ...zonas.reduce((options, zona) => {
            options[zona.name] = zona.name;
            return options;
          }, {}),
        },
        inputPlaceholder: 'Selecciona una Zona',
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return 'Debes seleccionar una Zona';
          }
        },
      });
  
      if (zonaName) {
        const selectedZona = zonas.find((zona) => zona.name === zonaName);
        addGeometriesToMap([selectedZona]);
      }
    } catch (error) {
      console.error('Error al obtener la zona por ID', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al obtener la zona por ID',
      });
    }
  };


  //Render
  return (
    <div>
      <div id="map" style={{ height: '90vh', width: '100vw' }} />
      <button onClick={handleCreateZona}>Crear Zona</button>
      <button onClick={handleGetAllZonas}>Obtener Todas las Zonas</button>
      <button onClick={handleGetZonaById}>Obtener Zona por ID</button>
      {/* <button onClick={handleUpdateZona}>Actualizar Zona por ID</button> */}
    </div>
  );
};

export default MapView;
