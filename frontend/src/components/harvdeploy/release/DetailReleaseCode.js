import moment from "moment";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactJson from "@microlink/react-json-view";
import { JsonDiv } from "../../styled";
import {
  handleSelectFactory,
  transformHarvOptions,
} from "../../../utils/utils";
import { queryHarvester } from "../../../features/harvester/harvesterSlice";
import ScheduleModal from "../../modals/ScheduleModal";
import { handleReleaseFormSubmit } from "../../../utils/services";

function DetailReleaseCode(props) {
  const [releaseObj, setReleaseObj] = useState(null);
  const [selectedHarvId, setSelectedHarvId] = useState(null);
  const { releasecode } = useSelector((state) => state.harvdeploy);
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
        <table className="table">
          <thead>
            <tr>
              <td>Version</td>
              <td>Fruit</td>
              <td>Created At</td>
              <td>Updated At</td>
              <td>Schedule Deployment</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{releasecode.version}</td>
              <td>{releasecode.fruit?.name}</td>
              <td>{moment(releasecode.created).format("LLLL")}</td>
              <td>{moment(releasecode.lastModified).format("LLLL")}</td>
              <td>
                <span
                  onClick={() => modalPopUp(releasecode)}
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
          </tbody>
        </table>
      </div>
      <div>
        <JsonDiv>
          <ReactJson
            src={releasecode.release}
            collapsed={2}
            thme="monokai"
            enableClipboard
          />
        </JsonDiv>
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

DetailReleaseCode.propTypes = {};

export default DetailReleaseCode;
