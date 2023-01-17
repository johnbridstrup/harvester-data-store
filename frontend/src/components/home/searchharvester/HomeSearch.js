import PropTypes from "prop-types";
import { darkThemeClass } from "utils/utils";

function HomeSearch(props) {
  const cardtheme = darkThemeClass("dt-card-theme", props.theme);
  const searchwrap = darkThemeClass("dt-search-wrap", props.theme);
  const inputtheme = darkThemeClass("dt-input-theme", props.theme);
  const spandark = darkThemeClass("dt-span-dark", props.theme);

  return (
    <div className={`card card-body mb-4 ${cardtheme}`}>
      <div className="harv-search-heading">Search Harvester By Harv ID</div>
      <div className="harv-search">
        <div className={`search-wrap ${searchwrap}`}>
          <i className="las la-search"></i>
          <input
            name="search"
            type="number"
            id="search"
            placeholder="e.g 100"
            className={`${inputtheme}`}
            onKeyDown={props.handleKeyDown}
            onChange={props.handleChange}
            required
          />
          <span onClick={props.handleSearch} className={`${spandark}`}>
            Search
          </span>
        </div>
      </div>
    </div>
  );
}

HomeSearch.propTypes = {
  handleKeyDown: PropTypes.func,
  handleChange: PropTypes.func,
  handleSearch: PropTypes.func,
  theme: PropTypes.string,
};

export default HomeSearch;
