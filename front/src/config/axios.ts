import axios from "axios";
import i18n from "i18next";

export const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:7777`;

export const Axios = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

Axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  let lang = i18n.language || localStorage.getItem("i18nextLng") || "en";

  if (lang === "hy") lang = "am";

  config.params = {
    ...config.params,
    lang: lang,
    _cache: Date.now(),
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
