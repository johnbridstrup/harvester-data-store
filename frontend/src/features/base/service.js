import axios from "axios";
import { CSRF_URL, OPENAPI_URL } from "./constants";

export const axiosService = {
  config: {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
  },
  post: async function (url, token, data = {}) {
    let csrftoken = localStorage.getItem("csrftoken");
    if (typeof token === "string" && token.length > 0) {
      this.config["headers"]["Authorization"] = `Token ${token}`;
    }
    this.config["headers"]["X-CSRFToken"] = csrftoken;
    const res = await axios.post(url, data, this.config);
    return res.data;
  },
  get: async function (url, token) {
    if (typeof token === "string" && token.length > 0) {
      this.config["headers"]["Authorization"] = `Token ${token}`;
    }
    const res = await axios.get(url, this.config);
    return res.data.data;
  },
  put: async function (url, token, data = {}) {
    let csrftoken = localStorage.getItem("csrftoken");
    if (typeof token === "string" && token.length > 0) {
      this.config["headers"]["Authorization"] = `Token ${token}`;
    }
    this.config["headers"]["X-CSRFToken"] = csrftoken;
    const res = await axios.put(url, data, this.config);
    return res.data;
  },
  patch: async function (url, token, data = {}) {
    let csrftoken = localStorage.getItem("csrftoken");
    if (typeof token === "string" && token.length > 0) {
      this.config["headers"]["Authorization"] = `Token ${token}`;
    }
    this.config["headers"]["X-CSRFToken"] = csrftoken;
    const res = await axios.patch(url, data, this.config);
    return res.data;
  },
  delete: async function (url, token) {
    if (typeof token === "string" && token.length > 0) {
      this.config["headers"]["Authorization"] = `Token ${token}`;
    }
    const res = await axios.delete(url, this.config);
    return res.data;
  },
  upload: async function (url, token, data = {}) {
    let csrftoken = localStorage.getItem("csrftoken");
    if (typeof token === "string" && token.length > 0) {
      this.config["headers"]["Authorization"] = `Token ${token}`;
    }
    this.config["headers"]["X-CSRFToken"] = csrftoken;
    this.config["headers"]["Content-Type"] = "multipart/form-data";
    const res = await axios.post(url, data, this.config);
    return res.data;
  },
  openapi: async function (url, token) {
    delete this.config["headers"]["Accept"];
    if (typeof token === "string" && token.length > 0) {
      this.config["headers"]["Authorization"] = `Token ${token}`;
    }
    const res = await axios.get(url, this.config);
    return res.data;
  },
};

export const persistCSRFToken = async () => {
  const res = await axiosService.get(CSRF_URL, undefined);
  let csrftoken = res.data.csrftoken;
  if (typeof csrftoken === "string" && csrftoken.length > 0) {
    localStorage.setItem("csrftoken", csrftoken);
  }
};

export const openapiSchema = async (token) => {
  return await axiosService.openapi(OPENAPI_URL, token);
};

export const paginateRequest = async (url, token) => {
  const response = await axiosService.get(url, token);
  return response;
};
