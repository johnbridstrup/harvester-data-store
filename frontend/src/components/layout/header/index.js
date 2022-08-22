import PropTypes from "prop-types";

function Header(props) {
  return (
    <div className={props.className}>
      {props.title} {props.reportId}
    </div>
  );
}

Header.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
  reportId: PropTypes.string,
};

export default Header;
