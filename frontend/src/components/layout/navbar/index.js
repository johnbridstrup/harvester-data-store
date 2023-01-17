import { useState, useRef, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import Logo from "assets/images/advanced_farm_logo_alpha.png";
import { ArrowDown, Menu, Notification } from "assets/svg";
import { logout } from "features/auth/authSlice";
import {
  FULLFILLED_PROMISE,
  MAX_LIMIT,
  NOTIFY_CATEGORY,
} from "features/base/constants";
import notificationService from "features/notification/notificationService";
import useClickOutside from "hooks/clickOutSide";
import AllMenu from "./AllMenu";
import UserMenu from "./UserMenu";
import AdminMenu from "./AdminMenu";
import "./styles.css";

function Navbar(props) {
  const [showAllMenu, setshowAllMenu] = useState(false);
  const [showUserMenu, setshowUserMenu] = useState(false);
  const [showAdminMenu, setshowAdminMenu] = useState(false);
  const [count, setCount] = useState(0);
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const allMenuRef = useRef();
  const userMenuRef = useRef();
  const adminMenuRef = useRef(null);

  useClickOutside(allMenuRef, () => {
    setshowAllMenu(false);
  });
  useClickOutside(userMenuRef, () => {
    setshowUserMenu(false);
  });
  useClickOutside(adminMenuRef, () => {
    setshowAdminMenu(false);
  });

  const fetchNotification = useCallback(() => {
    (async () => {
      try {
        const res = await notificationService.queryNotification(
          { category: NOTIFY_CATEGORY.isRecipient, limit: MAX_LIMIT },
          token
        );
        setCount(res.count);
      } catch (error) {
        setCount(0);
      }
    })();
  }, [token]);

  useEffect(() => {
    fetchNotification();
  }, [fetchNotification]);

  const handleLogout = async () => {
    const res = await dispatch(logout({ token }));
    if (res.type === FULLFILLED_PROMISE.logout) {
      window.location.reload();
    }
  };

  return (
    <header>
      <div className="container-fluid header">
        <div className="header-left">
          <Link to="/" className="header-logo">
            <div className="circle">
              <img src={Logo} alt="" />
            </div>
          </Link>
          {user?.is_superuser && (
            <div className="admin-menu-wrap" ref={adminMenuRef}>
              <div
                onClick={() => setshowAdminMenu((prev) => !prev)}
                className="text-secondary cursor"
              >
                Admin
              </div>
              <div
                className={`circle-icon hover1 ${
                  showAdminMenu && "active-header"
                }`}
              >
                <div onClick={() => setshowAdminMenu((prev) => !prev)}>
                  <ArrowDown />
                </div>
                {showAdminMenu && <AdminMenu />}
              </div>
            </div>
          )}
        </div>
        <div className="header-middle"></div>
        <div className="header-right">
          <Link to="/users/profile/me" className="profile-link hover1">
            <img
              src="https://bootdey.com/img/Content/avatar/avatar7.png"
              alt=""
            />
            <span>{user?.first_name}</span>
          </Link>
          <div
            className={`circle-icon hover1 ${showAllMenu && "active-header"}`}
            ref={allMenuRef}
          >
            <div onClick={() => setshowAllMenu((prev) => !prev)}>
              <Menu />
            </div>
            {showAllMenu && <AllMenu user={user} />}
          </div>
          <Link to="/notifications" className="circle-icon hover1">
            <Notification />
            <div className="right-notification">{count}</div>
          </Link>
          <div
            className={`circle-icon hover1 ${showUserMenu && "active-header"}`}
            ref={userMenuRef}
          >
            <div onClick={() => setshowUserMenu((prev) => !prev)}>
              <ArrowDown />
            </div>
            {showUserMenu && <UserMenu user={user} logout={handleLogout} />}
          </div>
        </div>
      </div>
    </header>
  );
}

Navbar.propTypes = {};

export default Navbar;
