import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import MainLayout from "../../components/layout/main";
import { menu, adminMenu } from "../../assets/menu";
import "./styles.css";
import LandingView from "../../components/home";
import { imagePath } from "utils/utils";

function Home(props) {
  const { user } = useSelector((state) => state.auth);
  const menus = user.is_superuser ? adminMenu : menu;
  return (
    <MainLayout>
      <div className="container">
        <div className="mb-5">
          <h2 className="display-4">Welcome to HDS</h2>
        </div>
        <LandingView />
        <div className="row mb-4">
          {menus.map((item, index) => (
            <Link
              to={item.href}
              key={index}
              className="col-md-4 link-secondary mt-4"
            >
              <div className="card card-body hover1">
                <div className="link-icon-container">
                  <img
                    className="menu-icon"
                    src={imagePath(item.icon)}
                    alt={`${item.icon}`}
                  />
                  <span className="link">{item.name}</span>
                </div>
                <div>{item.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

Home.propTypes = {};

export default Home;
