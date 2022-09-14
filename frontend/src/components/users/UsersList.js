function UsersList(props) {
  return (
    <>
      <div className="flex-right mb-2">
        <button className="btn btn-primary">Add New User</button>
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
    </>
  );
}

UsersList.propTypes = {};

export default UsersList;
