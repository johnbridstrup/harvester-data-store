import axios from "axios";
import { CSRF_URL } from "./constants";


export const networkRequest = async (url, method, token="435b18abedef452f64e7f4ed2e68e98ac8babf5e", data={}) => {
  const config = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
    credentials: 'include',
  }
  if(typeof method === "string" && method.length > 0 && method.toUpperCase() === "GET") {
    return (await axios.get(url, config)).data.data
  } else if (typeof method === "string" && method.length > 0 && method.toUpperCase() === "POST") {
    const response = await networkRequest(CSRF_URL, "GET");
    console.log(response)
    let csrftoken = response.data.csrftoken;
    config['headers']['X-CSRFToken'] = csrftoken
    console.log(csrftoken)
    return (await axios.post(url, data, config)).data
  }
}


export const axiosRequest =  {
  post: async function() {

  },
  get : async function() {

  }
}