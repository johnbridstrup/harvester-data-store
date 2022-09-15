import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import Logo from "../../../assets/images/advanced_farm_logo_alpha.png";
import { logout } from "../../../features/auth/authSlice";
import { API_BASE_URL } from "../../../features/base/constants";

function Navbar(props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const menuRef = useRef();
  const adminUrl = process.env.REACT_APP_ADMIN_URL || `${API_BASE_URL}/admin`;

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", checkIfClickedOutside);
    return () => {
      document.removeEventListener("mousedown", checkIfClickedOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    const res = await dispatch(logout({ token }));
    if (res.type === "auth/logout/fulfilled") {
      window.location.reload();
    }
  };

  const toggleMenuModal = () => setIsMenuOpen(!isMenuOpen);

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
          <div onClick={toggleMenuModal}>
            {user && user.username && (
              <div className="flex-align-center">
                <span>
                  <i className="las la-user-circle size-2x"></i>
                </span>
                <span className="mx-2">{user.username}</span>
              </div>
            )}
          </div>
          {isMenuOpen && (
            <div className="profile-menu" ref={menuRef}>
              <div className="py-2">
                <Link to="/users/profile/me" className="link-item">
                  <i className="las la-user size-2x"></i> My Profile
                </Link>
              </div>
              <div className="py-2">
                <Link to="/notifications" className="link-item">
                  <i className="las la-bell size-2x"></i> Notifications
                </Link>
              </div>
              {user?.is_superuser && (
                <div className="py-2">
                  <Link to="/users/all" className="link-item">
                    <i className="las la-users size-2x"></i> Users
                  </Link>
                </div>
              )}
              <div className="py-2">
                <Link to="/accounts/settings" className="link-item">
                  <i className="las la-cog size-2x"></i> Settings
                </Link>
              </div>
            </div>
          )}
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
