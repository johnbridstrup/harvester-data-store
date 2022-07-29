import { useEffect } from 'react';
import BaseRouter from "./routes";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { persistCSRFToken } from './features/base/service';

function App() {
  useEffect(() => {
    (async() => {
      persistCSRFToken();
    })();
  });
  return (
    <>
    <BaseRouter />
    <ToastContainer />
    </>
  );
}

export default App;
