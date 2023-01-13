import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { API_BASE_URL } from "features/base/constants";
import { darkThemeClass } from "utils/utils";

function AdminMenu(props) {
  const adminUrl = process.env.REACT_APP_ADMIN_URL || `${API_BASE_URL}/admin`;
  const darktheme = darkThemeClass("dt-theme-mode", props.theme);
  const whitecolor = darkThemeClass("dt-link-color", props.theme);
  return (
    <div className={`admin-menu ${darktheme}`}>
      <div className="admin-menu-link hover3">
        <a
          href={adminUrl}
          target="_blank"
          rel="noreferrer"
          className={`text-secondary ${whitecolor}`}
        >
          Administator
        </a>
      </div>
      <div className="menu-splitter"></div>
      <div className="admin-menu-link hover3">
        <Link to={`/migrations`} className={`text-secondary ${whitecolor}`}>
          HDS Migrations
        </Link>
      </div>
      <div className="menu-splitter"></div>
    </div>
  );
}

AdminMenu.propTypes = {
  theme: PropTypes.string,
};

export default AdminMenu;
