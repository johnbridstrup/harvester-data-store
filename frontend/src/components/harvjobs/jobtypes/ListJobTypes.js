import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { SUCCESS } from "../../../features/base/constants";
import {
  createJobType,
  listJobTypes,
  updateJobType,
} from "../../../features/harvjobs/harvjobSlice";
import { Loader } from "../../../utils/utils";
import JobTypeModal from "../../modals/JobTypeModal";
import { LoaderDiv } from "../../styled";
import JobTypeTable from "../../tables/JobTypeTable";

function ListJobTypes(props) {
  const [fieldData, setFieldData] = useState({
    name: "",
    mode: "add",
    objId: null,
  });
  const { jobtypes, loading } = useSelector((state) => state.harvjobs);
  const jobTypeRef = useRef();
  const dispatch = useDispatch();

  const handleFieldChange = (e) => {
    setFieldData((current) => {
      return { ...current, [e.target.name]: e.target.value };
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const dispatchObj = {
      add: createJobType,
      edit: updateJobType,
    };

    const res = await dispatch(dispatchObj[fieldData.mode](fieldData));
    if (res.payload?.status === SUCCESS) {
      await dispatch(listJobTypes());
      toast.success(res?.payload?.message);
      addPopUp();
      setFieldData((current) => {
        return { ...current, name: "", mode: "add", objId: null };
      });
    } else {
      toast.error(res?.payload);
    }
  };

  const addPopUp = (mode) => {
    if (typeof mode === "string" && mode === "add") {
      setFieldData((current) => {
        return { ...current, name: "", mode: "add", objId: null };
      });
    }
    jobTypeRef.current.click();
  };

  const handleJTUpdateClick = (jobObj) => {
    setFieldData((current) => {
      return {
        ...current,
        name: jobObj.name,
        mode: "edit",
        objId: jobObj.id,
      };
    });
    addPopUp();
  };

  return (
    <>
      <div className="flex-right mb-4 mt-4">
        <button onClick={() => addPopUp("add")} className="btn btn-primary">
          Add New Job Type
        </button>
        <button
          ref={jobTypeRef}
          data-bs-toggle="modal"
          data-bs-target="#jobTypeModal"
          style={{ display: "none" }}
        >
          Add New Job Type
        </button>
      </div>
      {loading ? (
        <LoaderDiv>
          <Loader size={50} />
        </LoaderDiv>
      ) : (
        <JobTypeTable
          jobtypes={jobtypes}
          handleJTUpdateClick={handleJTUpdateClick}
        />
      )}
      <JobTypeModal
        fieldData={fieldData}
        handleChange={handleFieldChange}
        handleSubmit={handleFormSubmit}
      />
    </>
  );
}

ListJobTypes.propTypes = {};

export default ListJobTypes;
