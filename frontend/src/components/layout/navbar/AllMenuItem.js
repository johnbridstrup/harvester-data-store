import PropTypes from "prop-types";
import { Link } from "react-router-dom";

function AllMenuItem(props) {
  return (
    <div className="all-menu-item hover1">
      <img src={`../../../icons/${props.icon}.png`} alt="menu" />
      <Link to={props.href} className="all-menu-col">
        <span>{props.name}</span>
        <span>{props.description}</span>
      </Link>
    </div>
  );
}

AllMenuItem.propTypes = {
  icon: PropTypes.string,
  name: PropTypes.string,
  description: PropTypes.string,
  href: PropTypes.string,
};

export default AllMenuItem;
