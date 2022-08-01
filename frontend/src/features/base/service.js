import axios from "axios";
import { CSRF_URL } from "./constants";


export const axiosService =  {
  config: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  },
  post: async function(url, token, data={}) {
    let csrftoken = localStorage.getItem('csrftoken')
    if (typeof token === "string" && token.length > 0) {
      this.config['headers']['Authorization'] = `Token ${token}`
    }
    this.config['headers']['X-CSRFToken'] = csrftoken
    const res = await axios.post(url, data, this.config)
    return res.data;
  },
  get: async function(url, token) {
    if (typeof token === "string" && token.length > 0) {
      this.config['headers']['Authorization'] = `Token ${token}`
    }
    const res = await axios.get(url, this.config);
    return res.data.data;
  }
}


export const persistCSRFToken = async () => {
  const res = await axiosService.get(CSRF_URL, undefined);
  let csrftoken = res.data.csrftoken;
  if (typeof csrftoken === "string" && csrftoken.length > 0) {
    localStorage.setItem("csrftoken", csrftoken);
  }
}