import BaseRouter from "./routes";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
    <BaseRouter />
    <ToastContainer />
    </>
  );
}

export default App;
