import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import { GenericPagination } from "components/pagination/Pagination";
import UsersList from "components/users/UsersList";
import { listUsers } from "features/user/userSlice";
import "./styles.css";

function UserListView(props) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(listUsers());
  }, [dispatch]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS User Management"}
          className={"display-6 mt-4 mb-4"}
        />
        <UsersList />
        <GenericPagination state="user" />
      </div>
    </MainLayout>
  );
}

UserListView.propTypes = {};

export default UserListView;
