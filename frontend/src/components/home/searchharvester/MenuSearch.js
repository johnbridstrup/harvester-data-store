import PropTypes from "prop-types";

function MenuSearch(props) {
  return (
    <>
      <div className="all-menu-group-header">Go To</div>
      <div className="all-menu-search mb-3">
        <i className="las la-search"></i>
        <input
          type="number"
          name="search"
          placeholder="Search Harvester By (harvId)"
          onChange={props.handleChange}
          onKeyDown={props.handleKeyDown}
        />
      </div>
    </>
  );
}

MenuSearch.propTypes = {
  handleChange: PropTypes.func,
  handleKeyDown: PropTypes.func,
};

export default MenuSearch;
