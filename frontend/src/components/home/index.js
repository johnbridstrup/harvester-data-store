import PropTypes from "prop-types";
import SearchHarvester from "./searchharvester";

function LandingView(props) {
  return (
    <div className="row">
      <div className="col-md-6 mx-auto">
        <SearchHarvester component="homepage" theme={props.theme} />
      </div>
    </div>
  );
}

LandingView.propTypes = {
  theme: PropTypes.string,
};

export default LandingView;
