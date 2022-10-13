import SearchHarvester from "./searchharvester";

function LandingView(props) {
  return (
    <div className="row">
      <div className="col-md-6 mx-auto">
        <SearchHarvester component="homepage" />
      </div>
    </div>
  );
}

LandingView.propTypes = {};

export default LandingView;
