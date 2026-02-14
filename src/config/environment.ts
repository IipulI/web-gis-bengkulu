const API = "api";
// const UPLOADS = "uploads";
const environment = {
  API_URL: import.meta.env.VITE_BACKEND_WEB_GIS_BASE_URL + API,
  IMAGE_URL: import.meta.env.VITE_BACKEND_WEB_GIS_BASE_URL_IMAGE,
};

export default environment;
