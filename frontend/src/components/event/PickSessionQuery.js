import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { queryPickSession } from "features/event/eventSlice";
import { FormQuery } from "./Helpers";
import {
  handleSelectFactory,
  transformHarvOptions,
  transformLocOptions,
} from "utils/utils";
import { timeStampFormat } from "utils/utils";
import { extractDateFromString } from "utils/utils";
import { translateHarvOptions } from "utils/utils";
import { translateLocOptions } from "utils/utils";

function PickSessionQuery(props) {
  const [selectedHarvId, setSelectedHarvId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [fieldData, setFieldData] = useState({
    uuid: "",
    start_time: "",
    end_time: "",
  });
  const { harvesters } = useSelector((state) => state.harvester);
  const { locations } = useSelector((state) => state.location);
  const { tags } = useSelector((state) => state.event);
  const { theme } = useSelector((state) => state.home);
  const dispatch = useDispatch();
  const harvesterOptions = transformHarvOptions(harvesters);
  const locationOptions = transformLocOptions(locations);
  const tagOptions = tags.map((x) => {
    return { label: x, value: x };
  });

  const handleHarvestSelect = handleSelectFactory(setSelectedHarvId);
  const handleLocationSelect = handleSelectFactory(setSelectedLocation);
  const handleTagSelect = handleSelectFactory(setSelectedTag);

  const handleFieldChange = (e) => {
    setFieldData((current) => {
      return { ...current, [e.target.name]: e.target.value };
    });
  };

  const buildQueryObj = () => {
    const queryObj = {};
    if (fieldData.start_time) {
      queryObj["start_time"] = timeStampFormat(
        extractDateFromString(fieldData.start_time)
      );
    }
    if (fieldData.end_time) {
      queryObj["end_time"] = timeStampFormat(
        extractDateFromString(fieldData.end_time)
      );
    }
    if (selectedHarvId && selectedHarvId.length > 0) {
      queryObj["harv_ids"] = translateHarvOptions(selectedHarvId);
    }
    if (selectedLocation && selectedLocation.length > 0) {
      queryObj["locations"] = translateLocOptions(selectedLocation);
    }
    if (selectedTag && selectedTag.length > 0) {
      queryObj["tags"] = selectedTag.map((x) => x.value);
    }
    if (fieldData.uuid) {
      queryObj["UUID"] = fieldData.uuid;
    }
    return queryObj;
  };

  const handleFormQuerySubmit = async (e) => {
    e.preventDefault();
    await dispatch(queryPickSession(buildQueryObj()));
  };

  return (
    <div className="mt-4 mb-4">
      <div className="flex-right">
        <span className="btn btn-sm">
          <Link to={`/events`}>Go To Events </Link>
          <i className="las la-arrow-right"></i>
        </span>
      </div>
      <FormQuery
        handleFieldChange={handleFieldChange}
        handleSubmit={handleFormQuerySubmit}
        label="PickSession"
        theme={theme}
        fieldData={fieldData}
        handleHarvestSelect={handleHarvestSelect}
        handleLocationSelect={handleLocationSelect}
        harvesterOptions={harvesterOptions}
        locationOptions={locationOptions}
        selectedHarvId={selectedHarvId}
        selectedLocation={selectedLocation}
        handleTagSelect={handleTagSelect}
        selectedTag={selectedTag}
        tagOptions={tagOptions}
      />
    </div>
  );
}

PickSessionQuery.propTypes = {};

export default PickSessionQuery;
