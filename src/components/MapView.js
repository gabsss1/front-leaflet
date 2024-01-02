import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { createZona, getAllZonas, deleteZona, updateZona} from '../service/zonaService';
import Swal from 'sweetalert2';
import { Button, Grid, Stack } from '@mui/material';

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
  const [selectedZona, setSelectedZona] = useState(null);
  const [editableLayer, setEditableLayer] = useState(null);
  const [editableLayers, setEditableLayers] = useState(null); // Agrega esta línea
  const [isEditing, setIsEditing] = useState(false);

  //Mapa
  useEffect(() => {
    const newMap = L.map('map').setView([-34.603722, -58.381592], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: false,
    }).addTo(newMap);

    const editableLayerGroup = L.layerGroup(); // Agrega esta línea
    setEditableLayers(editableLayerGroup); // Agrega esta línea
    newMap.addLayer(editableLayerGroup); // Agrega esta línea

    newMap.pm.addControls({
      position: 'topleft',
    });

    newMap.on('pm:create', (e) => {
      const layer = e.layer;
      const geoJSON = layer.toGeoJSON();
    
      setGeoJsonArray((prevArray) => [...prevArray, geoJSON]);
      layer.addTo(newMap); // Agrega la geometría al mapa

      console.log('Geometría creada:', geoJSON);
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

  //Get All Zonas
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

  const handleUpdateZona = async () => {
    try {
      const zonas = await getAllZonas();
  
      if (editableLayers) {
        editableLayers.clearLayers();
      }
  
      const { value: zonaName } = await Swal.fire({
        title: 'Seleccione una Zona para actualizar',
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
  
        console.log('Zona seleccionada para actualizar:', selectedZona);
  
        if (!selectedZona || !selectedZona.id) {
          console.error('Zona no encontrada o sin ID');
          return;
        }
  
        editableLayers.clearLayers();
        const editLayer = L.geoJSON(selectedZona.geometry);
        editLayer.addTo(editableLayers);
        editLayer.pm.enable();
  
        editLayer.on('pm:edit', (e) => {
          // Actualizar la geometría en tu estado local
          const updatedGeometry = e.target.toGeoJSON();
          setSelectedZona((prevSelectedZona) => ({
            ...prevSelectedZona,
            geometry: updatedGeometry,
          }));
        });
  
        const updatedZona = { ...selectedZona };
  
        setSelectedZona(async (prevSelectedZona) => {
          try {
            // Obtén solo la geometría actualizada, sin cambiar el nombre
            const updatedZonaData = await askForUpdatedZonaData(updatedZona);
            await updateZona(updatedZona.id, updatedZonaData);
  
            Swal.fire({
              icon: 'success',
              title: 'Zona Actualizada',
              text: 'La zona se ha actualizado exitosamente',
              position: 'top-end', // Ajusta la posición del mensaje
              toast: true, // Establece el modo de mensaje de tostada
              showConfirmButton: false, // Oculta el botón de confirmación
              timer: 3000, // Tiempo de duración del mensaje en milisegundos
            });
          } catch (error) {
            console.error('Error al actualizar la zona', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Hubo un error al actualizar la zona',
            });
          }
  
          // Devolver la zona actualizada para actualizar el estado
          return updatedZona;
        });
      }
    } catch (error) {
      console.error('Error al obtener zonas para actualizar', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al obtener zonas para actualizar',
      });
    }
  };
  
  
  const askForUpdatedZonaData = async (selectedZona) => {
    // Abre un modal de SweetAlert para recopilar datos actualizados
    const { value: updatedZonaData } = await Swal.fire({
      title: 'Actualizar Zona',
      html: `
        <label for="updatedName">Nombre:</label>
        <input id="updatedName" class="swal2-input" value="${selectedZona.name}">
        <label for="geoJsonInput">GeoJSON:</label>
        <textarea id="geoJsonInput" class="swal2-textarea">${JSON.stringify(selectedZona.geometry, null, 2)}</textarea>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const name = document.getElementById('updatedName').value;
        const geoJsonInput = document.getElementById('geoJsonInput').value;
  
        let features;
        try {
          features = JSON.parse(geoJsonInput).features;
        } catch (error) {
          Swal.showValidationMessage(`Error en el formato GeoJSON: ${error.message}`);
        }
  
        return {
          name,
          features: features || [],
          // Puedes incluir otros campos según tus necesidades
        };
      },
    }); 
    
  
    // Retorna los datos actualizados
    return updatedZonaData || {};
  };

  //Delete Zona
  const handleDeleteZona = async () => {
    try {
      const zonas = await getAllZonas();
    
      const { value: zonaName } = await Swal.fire({
        title: 'Seleccione una Zona para eliminar',
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
        await deleteZona(selectedZona.id);
        handleGetAllZonas();

      Swal.fire({
        icon: 'success',
        title: 'Zona Eliminada',
        text: 'La zona se ha eliminado exitosamente',
      });

      }
    } catch (error) {
      console.error('Error al eliminar la zona', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al eliminar la zona',
      });
    }
  };

  //Render
   return (
    <Grid container spacing={2} style={{ height: '100vh' }}>
      <Grid item xs={12} textAlign="center" justifyContent="center" display="flex">
        <Stack spacing={2} direction="row">
          <Button variant="contained" onClick={handleCreateZona}>
            Crear Zona
          </Button>
          <Button variant="contained" onClick={handleGetAllZonas}>
            Obtener Todas las Zonas
          </Button>
          <Button variant="contained" onClick={handleGetZonaById}>
            Obtener Zona por ID
          </Button>
          <Button variant="contained" onClick={handleUpdateZona}>
            Actualizar Zona
          </Button>
          <Button variant="contained" onClick={handleDeleteZona}>
            Eliminar Zona
          </Button>
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <div id="map" style={{ height: '100vh', width: '100%' }} />
      </Grid>
    </Grid>
  );
};

export default MapView;