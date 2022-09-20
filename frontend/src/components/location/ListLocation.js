import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { SUCCESS } from "../../features/base/constants";
import {
  createLocation,
  listLocations,
} from "../../features/location/locationSlice";
import { Loader } from "../../utils/utils";
import LocationModal from "../modals/LocationModal";
import { LoaderDiv } from "../styled";
import LocationTable from "../tables/LocationTable";

function ListLocation(props) {
  const [fieldData, setFieldData] = useState({
    ranch: "",
    country: "",
    region: "",
    mode: "add",
    objId: null,
  });
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const { locations, loading } = useSelector((state) => state.location);
  const dispatch = useDispatch();
  const locationRef = useRef();

  const handleFieldChange = (e) => {
    setFieldData((current) => {
      return { ...current, [e.target.name]: e.target.value };
    });
  };

  const handleDistrSelect = (newValue, actionMeta) => {
    setSelectedDistributor((current) => newValue);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const data = {};
    if (selectedDistributor && selectedDistributor.hasOwnProperty("value")) {
      data["distributor"] = selectedDistributor.value;
    }
    data["ranch"] = fieldData.ranch;
    data["country"] = fieldData.country;
    data["region"] = fieldData.region;
    data["objId"] = fieldData.objId;

    const dispatchObj = {
      add: createLocation,
    };

    const res = await dispatch(dispatchObj[fieldData.mode](data));
    if (res.payload?.status === SUCCESS) {
      await dispatch(listLocations());
      toast.success(res?.payload?.message);
      addPopUp();
      setFieldData((current) => {
        return {
          ...current,
          ranch: "",
          country: "",
          region: "",
          mode: "add",
          objId: null,
        };
      });
      setSelectedDistributor(null);
    } else {
      toast.error(res?.payload);
    }
  };

  const addPopUp = (mode) => {
    if (typeof mode === "string" && mode === "add") {
      setFieldData((current) => {
        return {
          ...current,
          ranch: "",
          country: "",
          region: "",
          mode: "add",
          objId: null,
        };
      });
      setSelectedDistributor(null);
    }
    locationRef.current.click();
  };

  const handleLocUpdateClick = (location) => {
    console.log(location);
  };

  return (
    <>
      <div className="flex-right">
        <button onClick={() => addPopUp("add")} className="btn btn-primary">
          Add New Location
        </button>
        <button
          ref={locationRef}
          data-bs-toggle="modal"
          data-bs-target="#locationModal"
          style={{ display: "none" }}
        >
          Add New Location
        </button>
      </div>
      {loading ? (
        <LoaderDiv>
          <Loader size={50} />
        </LoaderDiv>
      ) : (
        <LocationTable
          locations={locations}
          handleLocUpdateClick={handleLocUpdateClick}
        />
      )}
      <LocationModal
        distributorOptions={[]}
        fieldData={fieldData}
        handleChange={handleFieldChange}
        handleSubmit={handleFormSubmit}
        handleDistrSelect={handleDistrSelect}
        selectedDistributor={selectedDistributor}
      />
    </>
  );
}

ListLocation.propTypes = {};

export default ListLocation;
