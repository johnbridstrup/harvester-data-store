import PropTypes from "prop-types";
import { Link } from "react-router-dom";

function BackButton(props) {
  return (
    <div className={`${props.mb ? props.mb : ""} ${props.mt ? props.mt : ""}`}>
      <Link to={`/${props.route}`} className="btn">
        <i className="las la-arrow-left"></i>Back
      </Link>
    </div>
  );
}

BackButton.propTypes = {
  mb: PropTypes.string,
  mt: PropTypes.string,
  route: PropTypes.string,
};

export default BackButton;
