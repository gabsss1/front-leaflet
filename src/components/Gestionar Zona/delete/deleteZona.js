import React from 'react';
import Swal from 'sweetalert2';
import { deleteZona } from '../../../service/zonaService';
import { Button } from '@mui/material';
import { getAllZonas } from '../../../service/zonaService';

const DeleteZona = () => {
  
    const handleDeleteZona = async () => {
      try {
        const zonas = await getAllZonas();

        const { value: zonaName } = await Swal.fire({
          title: "Seleccione una Zona para eliminar",
          input: "select",
          inputOptions: {
            ...zonas.reduce((options, zona) => {
              options[zona.name] = zona.name;
              return options;
            }, {}),
          },
          inputPlaceholder: "Selecciona una Zona",
          showCancelButton: true,
          inputValidator: (value) => {
            if (!value) {
              return "Debes seleccionar una Zona";
            }
          },
        });

        if (zonaName) {
          const selectedZona = zonas.find((zona) => zona.name === zonaName);
          await deleteZona(selectedZona.id);

          Swal.fire({
            title: "Zona Eliminada",
            text: "La zona se ha eliminado exitosamente",
          });
        }
      } catch (error) {
        console.error("Error al eliminar la zona", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un error al eliminar la zona",
        });
      }
    };

    return (
        <Button variant="contained" onClick={handleDeleteZona}>
            Eliminar Zona
        </Button>
    );
}

export default DeleteZona;