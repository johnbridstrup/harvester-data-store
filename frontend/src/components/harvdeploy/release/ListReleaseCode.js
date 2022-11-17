import moment from "moment";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { queryHarvester } from "../../../features/harvester/harvesterSlice";
import { handleReleaseFormSubmit } from "../../../utils/services";
import {
  handleSelectFactory,
  Loader,
  transformHarvOptions,
} from "../../../utils/utils";
import ScheduleModal from "../../modals/ScheduleModal";
import { LoaderDiv } from "../../styled";

function ListReleaseCode(props) {
  const [releaseObj, setReleaseObj] = useState(null);
  const [selectedHarvId, setSelectedHarvId] = useState(null);
  const { releasecodes, loading } = useSelector((state) => state.harvdeploy);
  const { harvesters } = useSelector((state) => state.harvester);
  const dispatch = useDispatch();
  const modalRef = useRef();
  const harvOptions = transformHarvOptions(harvesters);

  const handleFormSubmit = handleReleaseFormSubmit(
    releaseObj,
    selectedHarvId,
    dispatch
  );
  const handleSelect = handleSelectFactory(setSelectedHarvId);

  const modalPopUp = async (obj) => {
    setReleaseObj((current) => obj);
    await dispatch(queryHarvester({ fruit__name: obj.fruit?.name }));
    modalRef.current.click();
  };

  return (
    <>
      <div className="table-responsive">
        {loading ? (
          <LoaderDiv>
            <Loader size={50} />
          </LoaderDiv>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Version</th>
                <th>Fruit</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Schedule Deployment</th>
              </tr>
            </thead>
            <tbody>
              {releasecodes.map((obj, _) => (
                <tr key={obj.id}>
                  <td>{obj.id}</td>
                  <td>
                    <Link to={`/release/${obj.id}`}>{obj.version}</Link>
                  </td>
                  <td>{obj.fruit?.name}</td>
                  <td>{moment(obj.created).format("LLLL")}</td>
                  <td>{moment(obj.lastModified).format("LLLL")}</td>
                  <td>
                    <span
                      onClick={() => modalPopUp(obj)}
                      className="btn btn-sm"
                    >
                      Schedule
                    </span>
                    <button
                      ref={modalRef}
                      type="button"
                      data-bs-toggle="modal"
                      data-bs-target="#scheduleModal"
                      style={{ display: "none" }}
                    >
                      Schedule
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <ScheduleModal
        handleSubmit={handleFormSubmit}
        harvOptions={harvOptions}
        selectedHarvId={selectedHarvId}
        handleHarvIdSelect={handleSelect}
      />
    </>
  );
}

ListReleaseCode.propTypes = {};

export default ListReleaseCode;
