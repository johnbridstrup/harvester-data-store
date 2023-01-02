import moment from "moment";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { SUCCESS } from "features/base/constants";
import { listTags, updateRelease } from "features/harvdeploy/harvdeploySlice";
import { queryHarvester } from "features/harvester/harvesterSlice";
import { handleReleaseFormSubmit } from "utils/services";
import { handleSelectFactory, Loader, transformHarvOptions } from "utils/utils";
import ReleaseTagModal from "components/modals/ReleaseTagModal";
import ScheduleModal from "components/modals/ScheduleModal";
import { LoaderDiv } from "components/styled";

function ListReleaseCode(props) {
  const [releaseObj, setReleaseObj] = useState(null);
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [selectedHarvId, setSelectedHarvId] = useState(null);
  const [fieldData, setFieldData] = useState({
    tag: "",
  });
  const { releasecodes, loading } = useSelector((state) => state.harvdeploy);
  const { harvesters } = useSelector((state) => state.harvester);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const modalRef = useRef();
  const tagRef = useRef(null);
  const harvOptions = transformHarvOptions(harvesters);

  const handleFormSubmit = handleReleaseFormSubmit(
    releaseObj,
    selectedHarvId,
    user,
    dispatch
  );
  const handleSelect = handleSelectFactory(setSelectedHarvId);

  const handleFieldChange = (e) => {
    setFieldData((current) => {
      return { ...current, [e.target.name]: e.target.value };
    });
  };

  const modalPopUp = async (obj) => {
    setReleaseObj((current) => obj);
    await dispatch(queryHarvester({ fruit__name: obj.fruit?.name }));
    modalRef.current.click();
  };

  const tagPopup = (obj) => {
    setSelectedRelease((current) => obj);
    tagRef.current.click();
  };

  const handleTagSubmit = async (e) => {
    e.preventDefault();

    let tags = fieldData.tag.split(/\s*,\s*/);
    let data = {
      ...selectedRelease?.release,
      tags: tags,
      id: selectedRelease?.id,
    };
    const res = await dispatch(updateRelease(data));
    if (res.payload?.status === SUCCESS) {
      await dispatch(listTags());
      toast.success(res.payload?.message);
      tagRef.current.click();
      setFieldData((current) => {
        return { ...current, tag: "" };
      });
    } else {
      toast.error(res.payload);
    }
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
                <th>Add Tags</th>
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
                  <td>
                    <span onClick={() => tagPopup(obj)} className="btn btn-sm">
                      Add Tags
                    </span>
                    <button
                      ref={tagRef}
                      type="button"
                      data-bs-toggle="modal"
                      data-bs-target="#tagModal"
                      style={{ display: "none" }}
                    >
                      Add Tags
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
      <ReleaseTagModal
        handleChange={handleFieldChange}
        handleSubmit={handleTagSubmit}
        fieldData={fieldData}
      />
    </>
  );
}

ListReleaseCode.propTypes = {};

export default ListReleaseCode;
