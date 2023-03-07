import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { queryEvent } from "features/event/eventSlice";
import { FormQuery } from "./Helpers";

function EventQuery(props) {
  const [uuid, setUUID] = useState("");
  const { theme } = useSelector((state) => state.home);
  const dispatch = useDispatch();

  const handleFieldChange = (e) => {
    setUUID(e.target.value);
  };

  const handleFormQuerySubmit = async (e) => {
    e.preventDefault();

    const queryObj = {};

    if (uuid) {
      queryObj["UUID"] = uuid;
    }
    await dispatch(queryEvent(queryObj));
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
        handleChange={handleFieldChange}
        handleSubmit={handleFormQuerySubmit}
        label="UUID"
        theme={theme}
        uuid={uuid}
      />
    </div>
  );
}

EventQuery.propTypes = {};

export default EventQuery;
