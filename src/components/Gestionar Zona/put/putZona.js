import React from "react";
import L from 'leaflet';
import Swal from "sweetalert2";
import { Button } from "@mui/material";
import { useMapContext } from "../../../MapContext/MapContext";
import { updateZona } from "../../../service/zonaService";
import { getAllZonas } from "../../../service/zonaService";

const PutZona = () => {

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

  //actualizar zona (manetener no cambiar)
  const handleUpdateZona = async () => {
    try {
      const zonas = await getAllZonas();

      if (editableLayers) {
        editableLayers.clearLayers();
      }

      const { value: zonaName } = await Swal.fire({
        title: "Seleccione una Zona para actualizar",
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

        console.log("Zona seleccionada para actualizar:", selectedZona);

        if (!selectedZona || !selectedZona.id) {
          console.error("Zona no encontrada o sin ID");
          return;
        }

        editableLayers.clearLayers();
        const editLayer = L.geoJSON(selectedZona.geometry);
        editLayer.addTo(editableLayers);
        editLayer.pm.enable();

        editLayer.on("pm:edit", (e) => {
          const updatedGeometry = e.target.toGeoJSON();
          setSelectedZona((prevSelectedZona) => ({
            ...prevSelectedZona,
            geometry: updatedGeometry,
          }));
        });

        const updatedZona = { ...selectedZona };

        setSelectedZona(async (prevSelectedZona) => {
          try {
            const updatedZonaData = await logicUpdate(updatedZona);
            await updateZona(updatedZona.id, updatedZonaData);

            Swal.fire({
              icon: "success",
              title: "Zona Actualizada",
              text: "La zona se ha actualizado exitosamente",
              position: "top-end",
              toast: true,
              showConfirmButton: false,
              timer: 3000,
            });
          } catch (error) {
            console.error("Error al actualizar la zona", error);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Hubo un error al actualizar la zona",
            });
          }
          return updatedZona;
        });
      }
    } catch (error) {
      console.error("Error al obtener zonas para actualizar", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al obtener zonas para actualizar",
      });
    }
  };

  // //ejecutar actualizacion de zona
  const logicUpdate = async () => {
    if (!editedLayer) {
      console.error("No hay capa editada para actualizar");
      return null;
    }

    const editedGeoJSON = editedLayer.toGeoJSON();
    const editedGeometry = editedGeoJSON.geometry;

    if (!editedGeometry) {
      console.error("La capa editada no tiene una geometría válida");
      return null;
    }

    const { value: confirm } = await Swal.fire({
      title: "Actualizar Zona",
      text: "¿Estás seguro de que deseas actualizar la zona?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, actualizar",
    });

    if (!confirm) {
      return null;
    }

    const updatedData = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: editedGeometry.type,
            coordinates: editedGeometry.coordinates,
          },
        },

        ...geoJsonArray,
      ],
    };

    console.log("Datos a enviar al servidor:", updatedData);

    return updatedData;
  };

    return (
      <div>
        <Button variant="contained" onClick={handleUpdateZona}>
          Actualizar Zona
        </Button>
      </div>
    );
};

export default PutZona;
