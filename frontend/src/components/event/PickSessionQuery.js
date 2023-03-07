import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { queryPickSession } from "features/event/eventSlice";
import { FormQuery } from "./Helpers";

function PickSessionQuery(props) {
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
    await dispatch(queryPickSession(queryObj));
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
        handleChange={handleFieldChange}
        handleSubmit={handleFormQuerySubmit}
        label="PickSession"
        theme={theme}
        uuid={uuid}
      />
    </div>
  );
}

PickSessionQuery.propTypes = {};

export default PickSessionQuery;
