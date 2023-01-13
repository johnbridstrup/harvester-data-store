import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { darkThemeClass, imagePath } from "utils/utils";

function AllMenuItem(props) {
  const spancolor = darkThemeClass("dt-span-color", props.theme);

  return (
    <div className="all-menu-item hover1">
      <img src={imagePath(props.icon)} alt="menu" />
      <Link to={props.href} className="all-menu-col">
        <span className={`all-menu-col-first ${spancolor}`}>{props.name}</span>
        <span className={`all-menu-col-last`}>{props.description}</span>
      </Link>
    </div>
  );
}

AllMenuItem.propTypes = {
  icon: PropTypes.string,
  name: PropTypes.string,
  description: PropTypes.string,
  href: PropTypes.string,
  theme: PropTypes.string,
};

export default AllMenuItem;
