import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { SUCCESS } from "features/base/constants";
import {
  createLocation,
  listLocations,
  updateLocation,
} from "features/location/locationSlice";
import { Loader, transformDistOptions } from "utils/utils";
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
    siteChannel: "",
  });
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const { locations, loading } = useSelector((state) => state.location);
  const { distributors } = useSelector((state) => state.distributor);
  const { theme } = useSelector((state) => state.home);
  const distributorOptions = transformDistOptions(distributors);
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
    data["site_channel"] = fieldData.siteChannel;

    const dispatchObj = {
      add: createLocation,
      edit: updateLocation,
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
          siteChannel: "",
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
          siteChannel: "",
        };
      });
      setSelectedDistributor(null);
    }
    locationRef.current.click();
  };

  const handleLocUpdateClick = (location) => {
    setFieldData((current) => {
      return {
        ...current,
        ranch: location.ranch,
        country: location.country,
        mode: "edit",
        region: location.region,
        objId: location.id,
        siteChannel: location.site_channel,
      };
    });
    let distObj = {
      value: location.distributor.id,
      label: location.distributor.name,
    };
    setSelectedDistributor((current) => distObj);
    addPopUp();
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
          theme={theme}
        />
      )}
      <LocationModal
        distributorOptions={distributorOptions}
        fieldData={fieldData}
        handleChange={handleFieldChange}
        handleSubmit={handleFormSubmit}
        handleDistrSelect={handleDistrSelect}
        selectedDistributor={selectedDistributor}
        theme={theme}
      />
    </>
  );
}

ListLocation.propTypes = {};

export default ListLocation;
