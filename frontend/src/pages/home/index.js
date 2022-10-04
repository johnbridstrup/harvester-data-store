import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/main";
import "./styles.css";

function Home(props) {
  return (
    <MainLayout>
      <div className="container">
        <div className="welcome-brand mb-5">
          <h2>Welcome to HDS</h2>
        </div>
        <div className="home-buttons">
          <Link to={"/errorreports"} className="btn btn-md btn-primary">
            Error Reports
          </Link>
          <Link to={"/harvesters"} className="btn btn-md btn-primary">
            Harvesters
          </Link>
          <Link to={"/locations"} className="btn btn-md btn-primary">
            Locations
          </Link>
          <Link to={"/distributors"} className="btn btn-md btn-primary">
            Distributors
          </Link>
          <Link to={"/events"} className="btn btn-md btn-primary">
            Events
          </Link>
          <Link to={"/release"} className="btn btn-md btn-primary">
            Harvester Releases
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}

Home.propTypes = {};

export default Home;
