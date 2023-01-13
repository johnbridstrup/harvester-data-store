import PropTypes from "prop-types";

function AutoMode(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20">
      <path
        fill={props.color}
        d="M10,0.469c-5.264,0-9.531,4.268-9.531,9.531c0,5.265,4.268,9.531,9.531,9.531c5.265,0,9.531-4.267,9.531-9.531C19.531,4.736,15.265,0.469,10,0.469 M10,18.665c-4.786,0-8.665-3.88-8.665-8.665c0-4.786,3.879-8.665,8.665-8.665V18.665z"
      ></path>
    </svg>
  );
}

AutoMode.propTypes = {
  color: PropTypes.string,
};

export default AutoMode;
