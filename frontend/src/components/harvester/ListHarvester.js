function ListHarvester(props) {
  return (
    <>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Harv ID</th>
              <th>Fruit</th>
              <th>Location</th>
              <th>Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>100</td>
              <td>Strawberry</td>
              <td>Ranch B</td>
              <td>Harvester One</td>
              <td>
                <span>
                  <i className="las la-pencil-alt"></i>
                </span>
                <span className="mx-4">
                  <i className="las la-times"></i>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

ListHarvester.propTypes = {};

export default ListHarvester;
