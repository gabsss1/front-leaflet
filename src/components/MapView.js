import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { createZona, getAllZonas, deleteZona, updateZona} from '../service/zonaService';
import Swal from 'sweetalert2';
import { Button, Grid, Stack } from '@mui/material';
import { useMapContext } from '../MapContext/MapContext';
import PostZona from './Gestionar Zona/post/postZona';
import DeleteZona from './Gestionar Zona/delete/deleteZona';
import GetZonas from './Gestionar Zona/get/getZonas';
import GetZonaById from './Gestionar Zona/get/getZonabyId';
import PutZona from './Gestionar Zona/put/putZona';

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

const MapView = ({ }) => {

  //Estados Globales
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

  //Mapa
  useEffect(() => {
    const newMap = L.map('map').setView([-34.603722, -58.381592], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: false,
    }).addTo(newMap);

    const editableLayerGroup = L.layerGroup();
    setEditableLayers(editableLayerGroup);
    newMap.addLayer(editableLayerGroup);

    newMap.pm.addControls({
      position: 'topleft',
      editMode: true,
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

  //Render
  return (
    <Grid container spacing={2} style={{ height: '100vh' }}>
      <Grid item xs={12} textAlign="center" justifyContent="center" display="flex">
        <Stack spacing={2} direction="row">
          <PostZona />
          <GetZonas />
          <GetZonaById />
          <PutZona />
          <DeleteZona />
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <div id="map" style={{ height: '100vh', width: '100%' }} />
      </Grid>
    </Grid>
  );
};

export default MapView;