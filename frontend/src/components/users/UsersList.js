import moment from "moment";
import { useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { createUser, listUsers } from "../../features/user/userSlice";
import { Loader } from "../../utils/utils";
import UserModal from "../modals/UserModal";
import { UserPagination } from "../pagination/Pagination";
import { LoaderDiv } from "../styled";

function UsersList(props) {
  const [fieldData, setFieldData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    slack_id: "",
    email: "",
    is_staff: "",
    password: "",
    password2: "",
  });
  const { users, loading } = useSelector((state) => state.user);
  const userRef = useRef();
  const dispatch = useDispatch();

  const handleFieldChange = (e) => {
    if (e.target.name === "is_staff") {
      setFieldData((current) => {
        return { ...current, is_staff: e.target.checked };
      });
    } else {
      setFieldData((current) => {
        return { ...current, [e.target.name]: e.target.value };
      });
    }
  };

  const modalPopUp = () => {
    userRef.current.click();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (fieldData.password !== fieldData.password2) {
      toast.error("passwords do not match!");
      return;
    }
    const data = { ...fieldData, profile: { slack_id: fieldData.slack_id } };
    const res = await dispatch(createUser(data));
    if (res.type === "user/createUser/fulfilled") {
      await dispatch(listUsers());
      toast.success("User created successfully");
      modalPopUp();
    }
  };

  return (
    <>
      <div className="flex-right mb-2">
        <button className="btn btn-primary" onClick={modalPopUp}>
          Add New User
        </button>
        <button
          ref={userRef}
          type="button"
          data-bs-toggle="modal"
          data-bs-target="#userModal"
          style={{ display: "none" }}
        >
          Create Notification
        </button>
      </div>
      {loading ? (
        <LoaderDiv>
          <Loader size={50} />
        </LoaderDiv>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Slack ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Status</th>
                <th>Role</th>
                <th>Last Login</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index}>
                  <td>{user.username}</td>
                  <td>{user.profile?.slack_id}</td>
                  <td>{user.first_name}</td>
                  <td>{user.last_name}</td>
                  <td>{user.is_active ? "Active" : "Inactive"}</td>
                  <td>
                    {user.is_staff ? "Staff" : "Regular User"}{" "}
                    {user.is_superuser && "Superuser"}
                  </td>
                  <td>{moment(user.last_login).format("LLLL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <UserPagination />
      <UserModal
        fieldData={fieldData}
        handleChange={handleFieldChange}
        handleSubmit={handleFormSubmit}
        loading={false}
      />
    </>
  );
}

UsersList.propTypes = {};

export default UsersList;
