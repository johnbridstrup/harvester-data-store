import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { SUCCESS } from "../../../features/base/constants";
import {
  createJobSchema,
  listJobSchemas,
  updateJobSchema,
} from "../../../features/harvjobs/harvjobSlice";
import { Loader, transformJobTypeOptions } from "../../../utils/utils";
import JobSchemaModal from "../../modals/JobSchemaModal";
import { LoaderDiv } from "../../styled";
import JobSchemaTable from "../../tables/JobSchemaTable";

function ListJobSchemas(props) {
  const [fieldData, setFieldData] = useState({
    version: "",
    comment: "",
    mode: "add",
    schema: "",
    objId: null,
  });
  const [selectedJobType, setSelectedJobType] = useState(null);
  const { jobschemas, jobtypes, loading } = useSelector(
    (state) => state.harvjobs
  );
  const jobSchemaRef = useRef();
  const dispatch = useDispatch();
  const jobtypeOptions = transformJobTypeOptions(jobtypes);

  const handleFieldChange = (e) => {
    setFieldData((current) => {
      return { ...current, [e.target.name]: e.target.value };
    });
  };

  const handleJobTypeSelect = (newValue, actionMeta) => {
    setSelectedJobType((current) => newValue);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const data = {};
    let schema = {};
    const dispatchObj = {
      add: createJobSchema,
      edit: updateJobSchema,
    };

    if (selectedJobType && selectedJobType.hasOwnProperty("value")) {
      data["jobtype"] = selectedJobType.value;
    }
    try {
      schema = JSON.parse(fieldData.schema);
    } catch (error) {
      schema = {};
    }
    data["version"] = fieldData.version;
    data["comment"] = fieldData.comment;
    data["schema"] = schema;
    data["objId"] = fieldData.objId;

    const res = await dispatch(dispatchObj[fieldData.mode](data));
    if (res.payload?.status === SUCCESS) {
      await dispatch(listJobSchemas());
      toast.success(res.payload?.message);
      addPopUp();
      setFieldData((current) => {
        return {
          ...current,
          version: "",
          comment: "",
          schema: "",
          mode: "add",
          objId: null,
        };
      });
      setSelectedJobType(null);
    } else {
      toast.error(res?.payload);
    }
  };

  const addPopUp = (mode) => {
    if (typeof mode === "string" && mode === "add") {
      setFieldData((current) => {
        return {
          ...current,
          mode: "add",
          comment: "",
          schema: "",
          version: "",
          objId: null,
        };
      });
      setSelectedJobType(null);
    }
    jobSchemaRef.current.click();
  };

  const handleJSUpdateClick = (schemaObj) => {
    setFieldData((current) => {
      return {
        ...current,
        version: schemaObj.version,
        comment: schemaObj.comment,
        schema: JSON.stringify(schemaObj.schema || {}),
        mode: "edit",
        objId: schemaObj.id,
      };
    });
    let jobtype = { label: schemaObj.jobtype, value: schemaObj.jobtype };
    setSelectedJobType((current) => jobtype);
    addPopUp();
  };

  return (
    <>
      <div className="flex-right mt-4 mb-4">
        <button onClick={() => addPopUp("add")} className="btn btn-primary">
          Add New Job Schema
        </button>
        <button
          ref={jobSchemaRef}
          data-bs-toggle="modal"
          data-bs-target="#jobSchemaModal"
          style={{ display: "none" }}
        >
          Add New Job Schema
        </button>
      </div>
      {loading ? (
        <LoaderDiv>
          <Loader size={50} />
        </LoaderDiv>
      ) : (
        <JobSchemaTable
          jobschemas={jobschemas}
          handleJSUpdateClick={handleJSUpdateClick}
        />
      )}
      <JobSchemaModal
        fieldData={fieldData}
        handleChange={handleFieldChange}
        handleSubmit={handleFormSubmit}
        handleJobTypeSelect={handleJobTypeSelect}
        selectedJobType={selectedJobType}
        jobtypeOptions={jobtypeOptions}
      />
    </>
  );
}

ListJobSchemas.propTypes = {};

export default ListJobSchemas;
