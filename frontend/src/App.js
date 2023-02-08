import { useEffect } from "react";
import { useDispatch } from "react-redux";
import BaseRoutes from "routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { persistCSRFToken } from "features/base/service";
import { authListener } from "features/auth/authSlice";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    persistCSRFToken();
    dispatch(authListener());
  }, [dispatch]);
  return (
    <>
      <BaseRoutes />
      <ToastContainer />
    </>
  );
}

export default App;
