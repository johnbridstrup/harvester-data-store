import moment from "moment";
import { useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { SUCCESS } from "features/base/constants";
import { createUser, listUsers, updateUser } from "features/user/userSlice";
import { Loader } from "utils/utils";
import UserModal from "../modals/UserModal";
import { LoaderDiv } from "../styled";

function UsersList(props) {
  const [fieldData, setFieldData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    slack_id: "",
    email: "",
    is_staff: false,
    password: "",
    password2: "",
    mode: "add",
    objId: null,
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

  const modalPopUp = (mode) => {
    if (typeof mode === "string" && mode === "add") {
      setFieldData((current) => {
        return {
          ...current,
          email: "",
          first_name: "",
          is_staff: false,
          last_name: "",
          mode: "add",
          slack_id: "",
          username: "",
          objId: null,
        };
      });
    }
    userRef.current.click();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (fieldData.password !== fieldData.password2) {
      toast.error("passwords do not match!");
      return;
    }
    const dispatchObj = {
      add: createUser,
      edit: updateUser,
    };
    const data = { ...fieldData, profile: { slack_id: fieldData.slack_id } };
    if (data.mode === "edit") {
      delete data.password;
      delete data.password2;
    }
    const res = await dispatch(dispatchObj[fieldData.mode](data));
    if (res?.payload?.status === SUCCESS) {
      await dispatch(listUsers());
      toast.success(res?.payload?.message);
      modalPopUp();
    } else {
      toast.error(res?.payload);
    }
  };

  const handleUserUpdateClick = (user) => {
    setFieldData((current) => {
      return {
        ...current,
        email: user.email,
        first_name: user.first_name,
        is_staff: user.is_staff,
        last_name: user.last_name,
        slack_id: user.profile?.slack_id,
        username: user.username,
        mode: "edit",
        objId: user.id,
        password: "",
        password2: "",
      };
    });
    modalPopUp();
  };

  return (
    <>
      <div className="flex-right mb-2">
        <button className="btn btn-primary" onClick={() => modalPopUp("add")}>
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
                <th>Email Address</th>
                <th>Status</th>
                <th>Role</th>
                <th>Last Login</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, _) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.profile?.slack_id}</td>
                  <td>{user.first_name}</td>
                  <td>{user.last_name}</td>
                  <td>{user.email}</td>
                  <td>{user.is_active ? "Active" : "Inactive"}</td>
                  <td>
                    {user.is_staff ? "Staff" : "Regular User"}{" "}
                    {user.is_superuser && "Superuser"}
                  </td>
                  <td>{moment(user.last_login).format("LLLL")}</td>
                  <td>
                    <i
                      onClick={() => handleUserUpdateClick(user)}
                      className="las la-pencil-alt"
                    ></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
