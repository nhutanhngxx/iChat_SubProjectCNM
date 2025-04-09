// src/services/api.js
import axios from "axios";
const API_URL = `http://${window.location.hostname}:5001/`;

const instance = axios.create({
  baseURL: API_URL, // hoặc domain của bạn
});

export default instance;
