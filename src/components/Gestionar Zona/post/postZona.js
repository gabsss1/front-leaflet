import React from 'react';
import Swal from 'sweetalert2';
import { createZona } from '../../../service/zonaService';
import { Button } from '@mui/material';
import { useMapContext } from '../../../MapContext/MapContext';

const PostZona = () => {
    const {
        geoJsonArray,
        setGeoJsonArray,
    } = useMapContext();

  //Create Zona
  const handleCreateZona = async () => {
    const name = await askForName();

    try {
      if (geoJsonArray.length === 0) {
        throw new Error("No se han dibujado geometrías");
      }

      const createdZona = await createZona({
        name,
        features: geoJsonArray,
      });

      console.log("Zona creada:", createdZona);

      Swal.fire({
        icon: "success",
        title: "Zona creada",
        text: "La zona se ha creado exitosamente",
      });

      setGeoJsonArray([]);
    } catch (error) {
      console.error("Error al crear la zona", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Hubo un error al crear la zona",
      });
    }
  };

  const askForName = async () => {
    const { value: name } = await Swal.fire({
      title: "Ingrese el nombre de la geometría:",
      input: "text",
      inputLabel: "Nombre",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "Debe ingresar un nombre";
        }
      },
    });

    return name || "Geometria sin nombre";
  };

  return (
    <div>
        <Button variant="contained" onClick={handleCreateZona}>
            Crear Zona
          </Button>
    </div>
  );
}

export default PostZona;