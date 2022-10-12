import MainLayout from "../../../components/layout/main";
import UserProfileDetail from "../../../components/profile/UserProfileDetail";
import "./styles.css";

function UserProfileView(props) {
  return (
    <MainLayout>
      <div className="container">
        <UserProfileDetail />
      </div>
    </MainLayout>
  );
}

UserProfileView.propTypes = {};

export default UserProfileView;
