import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import LogoFull from "assets/images/logo_full.png";
import { login } from "features/auth/authSlice";
import { persistCSRFToken } from "features/base/service";
import { Loader } from "utils/utils";
import "./styles.css";

function Login(props) {
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });
  const { loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setLoginData((current) => {
      return { ...current, [e.target.name]: e.target.value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await persistCSRFToken();
    const res = await dispatch(login(loginData));
    if (res.type === "auth/login/fulfilled") {
      navigate("/");
    } else {
      toast.error("invalid user credentials");
    }
  };

  const { username, password } = loginData;
  return (
    <div className="login-container">
      <div className="logo-full">
        <img src={LogoFull} alt="logo-full" />
      </div>
      <div>
        <form onSubmit={(e) => handleSubmit(e)}>
          <div className="form-wrapper">
            <div className="custom-form-group">
              <label className="custom-label">Username</label>
              <input
                type="text"
                className="custom-form-control"
                name="username"
                id="username"
                value={username}
                onChange={(e) => handleChange(e)}
              />
            </div>
            <div className="custom-form-group">
              <label className="custom-label">Password</label>
              <input
                type="password"
                className="custom-form-control"
                name="password"
                id="password"
                value={password}
                onChange={(e) => handleChange(e)}
              />
            </div>
            <div className="submit-group">
              <button type="submit" className="btn btn-md btn-primary">
                {loading ? <Loader size={25} /> : "Login"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

Login.propTypes = {};

export default Login;
