import React from 'react';
import L from 'leaflet';
import Swal from 'sweetalert2';
import { getAllZonas } from '../../../service/zonaService';
import { Button } from '@mui/material';
import { useMapContext } from '../../../MapContext/MapContext';

const GetZonas = () => {
  const {
    geoJsonArray,
    setGeoJsonArray,
    map,
    setMap,
    selectedZona,
    setSelectedZona,
    editableLayers,
    setEditableLayers,
    editedLayer,
    setEditedLayer,
  } = useMapContext();

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

  // Get All Zonas
  const handleGetAllZonas = async () => {
    try {
      const geometries = await getAllZonas();
      setGeoJsonArray(geometries);

      if (map) {
        geometries.forEach((zona) => {
          addToMap(zona);
        });
      }
    } catch (error) {
      console.error('Error al obtener todas las zonas', error);
    }
  };

  return (
    <Button variant="contained" onClick={handleGetAllZonas}>
      Obtener Zonas
    </Button>
  );
};

export default GetZonas;
