import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { transformFruitOptions, transformLocOptions } from "../../utils/utils";
import HarvesterModal from "../modals/HarvesterModal";

function ListHarvester(props) {
  const [fieldData, setFieldData] = useState({
    name: "",
    harv_id: "",
  });
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const { harvesters } = useSelector((state) => state.harvester);
  const { fruits } = useSelector((state) => state.fruit);
  const { locations } = useSelector((state) => state.location);
  const fruitOptions = transformFruitOptions(fruits);
  const locationOptions = transformLocOptions(locations);
  const harvesterRef = useRef();

  const handleFieldChange = (e) => {
    setFieldData((current) => {
      return { ...current, [e.target.name]: e.target.value };
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log(fieldData);
  };

  const handleLocationSelect = (newValue, actionMeta) => {
    setSelectedLocation((current) => newValue);
  };

  const handleFruitSelect = (newValue, actionMeta) => {
    setSelectedFruit((current) => newValue);
  };

  const addPopUp = () => {
    harvesterRef.current.click();
  };
  const editPopUp = () => console.log("edit pop up");
  const deletePopup = () => console.log("delete pop up");
  return (
    <>
      <div className="flex-right">
        <button onClick={addPopUp} className="btn btn-primary">
          Add New Harvester
        </button>
        <button
          ref={harvesterRef}
          data-bs-toggle="modal"
          data-bs-target="#harvesterModal"
          style={{ display: "none" }}
        >
          Add New Harvester
        </button>
      </div>
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
      <HarvesterModal
        fieldData={fieldData}
        handleChange={handleFieldChange}
        handleSubmit={handleFormSubmit}
        fruitOptions={fruitOptions}
        selectedFruit={selectedFruit}
        handleFruitSelect={handleFruitSelect}
        locationOptions={locationOptions}
        selectedLocation={selectedLocation}
        handleLocSelect={handleLocationSelect}
      />
    </>
  );
}

ListHarvester.propTypes = {};

export default ListHarvester;
