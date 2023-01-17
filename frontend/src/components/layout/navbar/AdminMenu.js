import { Link } from "react-router-dom";
import { API_BASE_URL } from "features/base/constants";

function AdminMenu(props) {
  const adminUrl = process.env.REACT_APP_ADMIN_URL || `${API_BASE_URL}/admin`;
  return (
    <div className="admin-menu">
      <div className="admin-menu-link hover3">
        <a
          href={adminUrl}
          target="_blank"
          rel="noreferrer"
          className="text-secondary"
        >
          Administator
        </a>
      </div>
      <div className="admin-menu-link hover3">
        <Link to={`/migrations`} className="text-secondary">
          HDS Migrations
        </Link>
      </div>
    </div>
  );
}

AdminMenu.propTypes = {};

export default AdminMenu;
