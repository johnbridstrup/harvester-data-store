import { useSelector } from "react-redux";

function ListHarvester(props) {
  const { harvesters } = useSelector((state) => state.harvester);
  const editPopUp = () => console.log("edit pop up");
  const deletePopup = () => console.log("delete pop up");
  return (
    <>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Harv ID</th>
              <th>Fruit</th>
              <th>Location</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {harvesters.map((harvester, index) => (
              <tr key={index} className="tr-hover">
                <td>{harvester.name}</td>
                <td>{harvester.harv_id}</td>
                <td>{harvester.fruit?.name}</td>
                <td>{harvester.location?.ranch}</td>
                <td>
                  <span>
                    <i onClick={editPopUp} className="las la-pencil-alt"></i>
                  </span>
                  <span className="mx-4">
                    <i onClick={deletePopup} className="las la-times"></i>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

ListHarvester.propTypes = {};

export default ListHarvester;
