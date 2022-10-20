import { useState } from "react";
import { useDispatch } from "react-redux";
import { queryEvent } from "../../features/event/eventSlice";
import { InputFormControl } from "../styled";

function EventQuery(props) {
  const [uuid, setUUID] = useState("");
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
      <form onSubmit={handleFormQuerySubmit}>
        <div className="form-group">
          <label>UUID</label>
          <InputFormControl
            type="text"
            name="uuid"
            value={uuid}
            onChange={handleFieldChange}
            placeholder="68b3aab6-24c9-11ed-bb17-f9799c718175"
          />
        </div>
        <div className="text-center mt-3">
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

EventQuery.propTypes = {};

export default EventQuery;
