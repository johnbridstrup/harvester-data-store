import PropTypes from "prop-types";
import { Link } from "react-router-dom";

function BackButton(props) {
  const goBack = (e) => {
    e.preventDefault();
    window.history.back();
  };
  return (
    <div className={`${props.mb ? props.mb : ""} ${props.mt ? props.mt : ""}`}>
      <Link to={``} className="btn" onClick={goBack}>
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
