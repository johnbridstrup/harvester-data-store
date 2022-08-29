import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import Logo from "../../../assets/images/advanced_farm_logo_alpha.png";
import { logout } from "../../../features/auth/authSlice";
import { API_BASE_URL } from "../../../features/base/constants";

function Navbar(props) {
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const adminUrl = process.env.REACT_APP_ADMIN_URL || `${API_BASE_URL}/admin`;

  const handleLogout = async () => {
    const res = await dispatch(logout({ token }));
    if (res.type === "auth/logout/fulfilled") {
      window.location.reload();
    }
  };
  return (
    <nav className="navbar bg-light">
      <div className="container">
        <div className="navbar-brand">
          <a className="" href="/">
            <img src={Logo} alt="logo" width="30" height="24" />
          </a>
          <a
            href={adminUrl}
            target="_blank"
            rel="noreferrer"
            className="admin-route"
          >
            Admin
          </a>
        </div>
        <div className="d-flex-relative">
          <div>
            {user && user.username && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <span>
                  <i className="las la-user-circle size-2x"></i>
                </span>
                <span className="mx-2">{user.username}</span>
              </div>
            )}
          </div>
          <div className="profile-modal">
            <div>
              <i class="las la-user size-2x"></i>My Profile
            </div>
            <div>
              <i class="las la-bell size-2x"></i>Notification
            </div>
          </div>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="btn btn-sm btn-warning">
              Logout
            </button>
          ) : (
            <Link to="/login" className="btn btn-sm btn-warning">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

Navbar.propTypes = {};

export default Navbar;
