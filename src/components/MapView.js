  import React, { useState } from 'react';
  import L from 'leaflet';
  import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
  import { EditControl } from 'react-leaflet-draw';
  import 'leaflet/dist/leaflet.css';
  import 'leaflet-draw/dist/leaflet.draw.css';
  import { createZona } from '../service/zonaService';
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
    const ZOOM_LEVEL = 5;
    const LATITUDE = -8.60057858288449;
    const LONGITUDE = -74.96387566349499;

    const [pendingGeometries, setPendingGeometries] = useState([]);

    const _created = (e) => {
      const { layer } = e;
      const geoJSON = layer.toGeoJSON();
      const { type, coordinates } = geoJSON.geometry;

      console.log('Created Geometry:', geoJSON);

      setPendingGeometries((prevGeometries) => [
        ...prevGeometries,
        { type, coordinates },
      ]);
    };

    const saveGeometries = async () => {
      const name = await askForName();

      try {
        const createdZona = await createZona({
          name,
          features: pendingGeometries.map((geometry) => ({ geometry })),
        });

        Swal.fire({
          title: '¡Buen trabajo!',
          text: 'Geometría creada',
          icon: 'success',
        });
        setPendingGeometries([]);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error al crear la geometría',
          text: '¡Algo salió mal!',
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

    return (
      <div style={{ position: 'relative', height: '100vh' }}>
        <MapContainer center={[LATITUDE, LONGITUDE]} zoom={ZOOM_LEVEL}>
          <TileLayer
            url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <FeatureGroup>
            <EditControl position='topright' onCreated={_created} />
          </FeatureGroup>
        </MapContainer>

        <button
          className="btn primary"
          style={{
            position: 'absolute',
            top: '100px',
            right: '1440px',
            zIndex: 1000,
          }}
          onClick={saveGeometries}
        >
          Save
        </button>
      </div>
    );
  };

  export default MapView;
