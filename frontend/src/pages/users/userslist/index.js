import Header from "../../../components/layout/header";
import MainLayout from "../../../components/layout/main";
import UsersList from "../../../components/users/UsersList";
import "./styles.css";

function UserListView(props) {
  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS User Management"}
          className={"display-6 mt-4 mb-4"}
        />
        <UsersList />
      </div>
    </MainLayout>
  );
}

UserListView.propTypes = {};

export default UserListView;
