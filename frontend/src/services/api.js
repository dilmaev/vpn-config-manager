import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const clientAPI = {
  create: async (clientData) => {
    const response = await api.post('/clients/create', clientData);
    return response.data;
  },

  list: async () => {
    const response = await api.get('/clients/list');
    return response.data;
  },

  get: async (name) => {
    const response = await api.get(`/clients/${name}`);
    return response.data;
  },

  delete: async (name) => {
    const response = await api.delete(`/clients/${name}`);
    return response.data;
  },

  getServerStatus: async () => {
    const response = await api.get('/clients/status/servers');
    return response.data;
  },
};

export const configAPI = {
  list: async () => {
    const response = await api.get('/configs');
    return response.data;
  },

  get: async (fileName) => {
    const response = await api.get(`/configs/${fileName}`);
    return response.data;
  },

  update: async (fileName, config) => {
    const response = await api.put(`/configs/${fileName}`, config);
    return response.data;
  },

  delete: async (fileName) => {
    const response = await api.delete(`/configs/${fileName}`);
    return response.data;
  },
};

export default api;