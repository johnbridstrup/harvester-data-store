import PropTypes from "prop-types";

function HomeSearch(props) {
  return (
    <div className="card card-body mb-4">
      <div className="harv-search-heading">Search Harvester By Harv ID</div>
      <div className="harv-search">
        <div className="search-wrap">
          <i className="las la-search"></i>
          <input
            name="search"
            type="number"
            id="search"
            placeholder="e.g 100"
            onKeyDown={props.handleKeyDown}
            onChange={props.handleChange}
            required
          />
          <span onClick={props.handleSearch}>Search</span>
        </div>
      </div>
    </div>
  );
}

HomeSearch.propTypes = {
  handleKeyDown: PropTypes.func,
  handleChange: PropTypes.func,
  handleSearch: PropTypes.func,
};

export default HomeSearch;
