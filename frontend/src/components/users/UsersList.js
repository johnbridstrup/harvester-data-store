import { useRef, useState } from "react";
import UserModal from "../modals/UserModal";

function UsersList(props) {
  const [fieldData, setFieldData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    slack_id: "",
    email: "",
  });
  const userRef = useRef();

  const handleFieldChange = (e) => {
    setFieldData((current) => {
      return { ...current, [e.target.name]: e.target.value };
    });
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log(fieldData);
  };

  const modalPopUp = () => {
    userRef.current.click();
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
            <tr>
              <td>aft</td>
              <td>slack@aft.aft</td>
              <td>Aft</td>
              <td>Aft</td>
              <td>Active</td>
              <td>Staff, Superuser</td>
              <td>{new Date().toLocaleDateString()}</td>
            </tr>
            <tr>
              <td>not_aft</td>
              <td>slack@not_aft.aft</td>
              <td>Not Aft</td>
              <td>Not Aft</td>
              <td>Active</td>
              <td>Staff</td>
              <td>{new Date().toLocaleDateString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
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
