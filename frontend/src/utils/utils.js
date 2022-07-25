import axios from 'axios';
import { Oval } from  'react-loader-spinner';


export async function getCsrfToken() {
  const HDS_PORT = process.env.REACT_APP_HDS_PORT || 8085;
  const CSRF_URL = `http://localhost:${HDS_PORT}/api/v1/users/csrf/`
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