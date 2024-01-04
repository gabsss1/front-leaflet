import React from 'react';
import L from 'leaflet';
import Swal from 'sweetalert2';
import { Button } from '@mui/material';
import { useMapContext } from '../../../MapContext/MapContext';
import { getAllZonas } from '../../../service/zonaService';

const GetZonaById = () => {

    const {
        editableLayers,
        setEditedLayer,
      } = useMapContext();

      //Get Zona by ID
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
  
        console.log('Zona seleccionada:', selectedZona);
  
        if (!selectedZona || !selectedZona.id) {
          console.error('Zona no encontrada o sin ID');
          return;
        }
  
        editableLayers.clearLayers();
        const editLayer = L.geoJSON(selectedZona.geometry);
        editLayer.addTo(editableLayers);
        editLayer.pm.enable();
  
        // Utilizar el manejador de edición para la capa existente en modo de prueba
        handleEdit(editLayer, true);
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

  const handleEdit = (editLayer, testMode = false) => {
    editLayer.on('pm:edit', (e) => {
      try {
        const updatedGeometry = e.layer.toGeoJSON().geometry;
        console.log('Coordenadas editadas:', updatedGeometry.coordinates);
        setEditedLayer(e.layer);

        if (!testMode) {
          // Lógica para guardar los cambios (si es necesario)
        }
      } catch (error) {
        console.error('Error en el manejador de pm:edit', error);
      }
    });
  };

  return(
    <Button variant="contained" onClick={handleGetZonaById}>
      Obtener Zona por ID
    </Button>
  );
}

export default GetZonaById;