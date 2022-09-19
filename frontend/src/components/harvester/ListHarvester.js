import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { SUCCESS } from "../../features/base/constants";
import {
  createHarvester,
  listHarvesters,
  updateHarvester,
} from "../../features/harvester/harvesterSlice";
import { transformFruitOptions, transformLocOptions } from "../../utils/utils";
import HarvesterModal from "../modals/HarvesterModal";

function ListHarvester(props) {
  const [fieldData, setFieldData] = useState({
    name: "",
    harv_id: "",
    mode: "add",
    objId: null,
  });
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const { harvesters } = useSelector((state) => state.harvester);
  const { fruits } = useSelector((state) => state.fruit);
  const { locations } = useSelector((state) => state.location);
  const fruitOptions = transformFruitOptions(fruits, true);
  const locationOptions = transformLocOptions(locations, true);
  const dispatch = useDispatch();
  const harvesterRef = useRef();

  const handleFieldChange = (e) => {
    setFieldData((current) => {
      return { ...current, [e.target.name]: e.target.value };
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const data = {};
    if (selectedFruit && selectedFruit.hasOwnProperty("value")) {
      data["fruit"] = selectedFruit.value;
    }
    if (selectedLocation && selectedLocation.hasOwnProperty("value")) {
      data["location"] = selectedLocation.value;
    }
    data["name"] = fieldData.name;
    data["harv_id"] = fieldData.harv_id;
    data["objId"] = fieldData.objId;

    const dispatchObj = {
      add: createHarvester,
      edit: updateHarvester,
    };

    const res = await dispatch(dispatchObj[fieldData.mode](data));
    if (res.payload?.status === SUCCESS) {
      await dispatch(listHarvesters());
      toast.success(res?.payload?.message);
      addPopUp();
      setFieldData((current) => {
        return { ...current, name: "", harv_id: "", mode: "add", objId: "" };
      });
      setSelectedFruit(null);
      setSelectedLocation(null);
    } else {
      toast.error(res?.payload);
    }
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

  const handleHarvUpdateClick = (harvObj) => {
    setFieldData((current) => {
      return {
        ...current,
        name: harvObj.name,
        harv_id: harvObj.harv_id,
        mode: "edit",
        objId: harvObj.id,
      };
    });
    let fruitObj = { value: harvObj.fruit.id, label: harvObj.fruit.name };
    let locObj = { value: harvObj.location.id, label: harvObj.location.ranch };
    setSelectedFruit((current) => fruitObj);
    setSelectedLocation((current) => locObj);
    addPopUp();
  };
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
                    <i
                      onClick={() => handleHarvUpdateClick(harvester)}
                      className="las la-pencil-alt"
                    ></i>
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
