import { useEffect } from "react";
import { useDispatch } from "react-redux";
import BaseRouter from "routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { persistCSRFToken } from "features/base/service";
import { authListener } from "features/auth/authSlice";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    (async () => {
      persistCSRFToken();
      dispatch(authListener());
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
