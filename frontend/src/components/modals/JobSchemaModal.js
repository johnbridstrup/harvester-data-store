import { lazy, Suspense } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import { Loader } from "../../utils/utils";
import { LoaderDiv } from "../styled";
const CodeEditor = lazy(() => import("@uiw/react-textarea-code-editor"));

function JobSchemaModal(props) {
  const { schema, version, comment, mode } = props.fieldData;
  return (
    <div className="col-md-8">
      <div
        className="modal fade"
        id="jobSchemaModal"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="exampleModalCenterTitle"
        aria-hidden="true"
        style={{ display: "none" }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content profile-modal">
            <div className="text-right">
              <button
                type="button"
                className="btn closeModalBtn"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span className="las la-times"></span>
              </button>
            </div>
            <div className="modal-body text-center px-5 pb-2">
              {mode === "edit" ? "UPDATE" : "ADD NEW"} JOB SCHEMA
            </div>

            <div className="modal-body px-5 pb-4">
              <form onSubmit={props.handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="version">Version</label>
                      <input
                        type="text"
                        className="form-control"
                        name="version"
                        value={version}
                        required
                        onChange={props.handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="jobtype">Job Type</label>
                      <Select
                        isSearchable
                        isClearable
                        placeholder="test"
                        options={props.jobtypeOptions}
                        name="jobtype"
                        onChange={props.handleJobTypeSelect}
                        defaultValue={props.selectedJobType}
                        value={props.selectedJobType}
                        className="multi-select-container"
                        classNamePrefix="select"
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="comment">Comment</label>
                      <textarea
                        className="form-control"
                        name="comment"
                        value={comment}
                        onChange={props.handleChange}
                        placeholder="write your comment here"
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <label htmlFor="schema">Schema</label>
                    <Suspense
                      fallback={
                        <LoaderDiv>
                          <Loader size={25} />
                        </LoaderDiv>
                      }
                    >
                      <CodeEditor
                        value={schema}
                        name="schema"
                        language="json5"
                        onChange={props.handleChange}
                        padding={15}
                        placeholder="Paste json schema here"
                        className="scrollbar"
                        style={{
                          fontSize: 12,
                          backgroundColor: "#f5f5f5",
                          fontFamily:
                            "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                          height: "300px",
                          overflowY: "scroll",
                        }}
                      />
                    </Suspense>
                  </div>
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-block btn-primary mt-4 mb-4"
                  >
                    {props.loading ? (
                      <Loader size={25} />
                    ) : mode === "edit" ? (
                      "EDIT"
                    ) : (
                      "ADD"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

JobSchemaModal.propTypes = {
  handleChange: PropTypes.func,
  fieldData: PropTypes.object,
  handleSubmit: PropTypes.func,
  loading: PropTypes.bool,
  jobtypeOptions: PropTypes.array,
  handleJobTypeSelect: PropTypes.func,
  selectedJobType: PropTypes.object,
};

export default JobSchemaModal;
