import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { darkThemeClass } from "utils/utils";

function UserMenu(props) {
  const darktheme = darkThemeClass("dt-theme-mode", props.theme);
  const whitecolor = darkThemeClass("dt-link-color", props.theme);
  const darkbg = darkThemeClass("dt-small-circle", props.theme);
  return (
    <div className={`user-menu ${darktheme}`}>
      <div>
        <Link to="/users/profile/me" className="user-menu-header hover3">
          <img
            src="https://bootdey.com/img/Content/avatar/avatar7.png"
            alt=""
          />
          <div className="menu-col">
            <span className={`${whitecolor}`}>
              {props.user?.first_name} {props.user?.last_name}
            </span>
            <span>See your profile</span>
          </div>
        </Link>
        <div className="menu-splitter"></div>
        <div className="menu-main hover3">
          <div className={`small-circle ${darkbg}`}>
            <i className="las la-comments"></i>
          </div>
          <a
            href="https://github.com/AdvancedFarm/hds/issues/new"
            target="_blank"
            rel="noreferrer"
            className="menu-col"
          >
            <div className={`menu-span1 ${whitecolor}`}>Give feedback</div>
            <div className="menu-span2">Help us improve HDS</div>
          </a>
        </div>
        <div className="menu-splitter"></div>
        <div className="menu-item hover3" onClick={props.logout}>
          <div className={`small-circle ${darkbg}`}>
            <i className="las la-sign-out-alt"></i>
          </div>
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
}

UserMenu.propTypes = {
  user: PropTypes.object,
  logout: PropTypes.func,
  theme: PropTypes.string,
};

export default UserMenu;
