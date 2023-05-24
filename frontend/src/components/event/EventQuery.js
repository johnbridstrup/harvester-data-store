import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { queryEvent } from "features/event/eventSlice";
import { paramsToObject, pushState } from "utils/utils";
import { PushStateEnum } from "features/base/constants";
import { FormQuery } from "./Helpers";

function EventQuery(props) {
  const [fieldData, setFieldData] = useState({
    uuid: "",
  });
  const { theme } = useSelector((state) => state.home);
  const dispatch = useDispatch();
  const { search } = useLocation();

  useEffect(() => {
    const paramsObj = paramsToObject(search);
    if (paramsObj.UUID)
      setFieldData((current) => {
        return { ...current, uuid: paramsObj.UUID };
      });
  }, [search]);

  const handleFieldChange = (e) => {
    setFieldData((current) => {
      return { ...current, [e.target.name]: e.target.value };
    });
  };

  const handleFormQuerySubmit = async (e) => {
    e.preventDefault();

    const queryObj = {};

    if (fieldData.uuid) {
      queryObj["UUID"] = fieldData.uuid;
    }
    dispatch(queryEvent(queryObj));
    pushState(queryObj, PushStateEnum.EVENTS);
  };

  return (
    <div className="mt-4 mb-4">
      <div className="flex-right">
        <span className="btn btn-sm">
          <Link to={`/picksessions`}>Go To PickSession </Link>
          <i className="las la-arrow-right"></i>
        </span>
      </div>
      <FormQuery
        handleSubmit={handleFormQuerySubmit}
        handleFieldChange={handleFieldChange}
        label="UUID"
        theme={theme}
        fieldData={fieldData}
      />
    </div>
  );
}

EventQuery.propTypes = {};

export default EventQuery;
