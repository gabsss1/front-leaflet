// zonaService.js

import axios from 'axios';

const BASE_URL = 'http://localhost:3000'; // Reemplaza con la URL de tu backend

export const getAllZonas = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/zona`);
    return response.data;
  } catch (error) {
    throw new Error('Error getting all zonas');
  }
};

export const getZonaById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/zona/${id}`);
    return response.data;
  } catch (error) {
    throw new Error('Error getting zona by ID');
  }
};

export const createZona = async (zonaData) => {
  try {
    const response = await axios.post(`${BASE_URL}/zona`, zonaData);
    return response.data;
  } catch (error) {
    console.error('Error updating zona:', error);
  
    if (error.response) {
      console.error('Server response:', error.response.data);
    }
  
    throw new Error('Error updating zona', error.response.data);
  }
};


export const updateZona = async (id, zonaData) => {
  try {
    const response = await axios.put(`${BASE_URL}/zona/${id}`, zonaData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating zona:', error);
    throw new Error('Error updating zona', error.response.data);
  }
};

export const deleteZona = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/zona/${id}`);
    return response.data;
  } catch (error) {
    throw new Error('Error deleting zona');
  }
};
