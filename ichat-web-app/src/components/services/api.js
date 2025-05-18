// src/services/api.js
import axios from "axios";
// const API_URL = `http://${window.location.hostname}:5001/api/`;
const REACT_APP_API_URL = process.env.REACT_APP_API_URL;
const API_URL = `${REACT_APP_API_URL}/api/`;

const instance = axios.create({
  baseURL: API_URL, // hoặc domain của bạn
});

export default instance;
