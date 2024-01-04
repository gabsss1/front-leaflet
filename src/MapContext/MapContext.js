import React, { createContext, useContext, useState } from 'react';

const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const [geoJsonArray, setGeoJsonArray] = useState([]);
  const [map, setMap] = useState(null);
  const [selectedZona, setSelectedZona] = useState(null);
  const [editableLayers, setEditableLayers] = useState(null);
  const [editedLayer, setEditedLayer] = useState([]);

  return (
    <MapContext.Provider
      value={{
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
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext debe ser usado dentro de MapProvider');
  }
  return context;
};