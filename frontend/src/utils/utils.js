import axios from 'axios';
import { Oval } from  'react-loader-spinner'


export async function getCsrfToken() {
  const CSRF_URL = "http://localhost:8085/api/v1/users/csrf/"
  const config = {
    credentials: 'include'
  }
  const response = await axios.get(CSRF_URL, config);
  let _csrfToken = response.data.data.data.csrftoken;
  return _csrfToken;
}

export const Loader = ({size}) => {
  return <Oval color="#00BFFF" height={size} width={size} />
}