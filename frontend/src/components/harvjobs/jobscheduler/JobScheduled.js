import { lazy, Suspense } from "react";
import PropTypes from "prop-types";
import { JsonDiv, LoaderDiv } from "components/styled";
import JobsTable from "./JobsTable";
import { Loader } from "utils/utils";
import { THEME_MODES } from "features/base/constants";
const ReactJson = lazy(() => import("@microlink/react-json-view"));

function JobScheduled(props) {
  return (
    <>
      <div className="col-md-7">
        <div className="mb-3 f-w-600">Recent Scheduled Jobs</div>
        {props.jobs.length > 0 ? (
          <JobsTable jobs={props.jobs} theme={props.theme} />
        ) : (
          <div className="jobs-wrapper">
            <div>No Scheduled Jobs Found</div>
          </div>
        )}
      </div>
      <div className="col-md-5">
        <div className="mb-3 f-w-600">Schema Version</div>
        <JsonDiv style={{ height: "75vh" }}>
          <Suspense
            fallback={
              <LoaderDiv>
                <Loader size={25} />
              </LoaderDiv>
            }
          >
            <ReactJson
              src={props.jobschema || {}}
              collapsed={4}
              enableClipboard
              theme={
                props.theme === THEME_MODES.DARK_THEME ? "monokai" : "monokaii"
              }
            />
          </Suspense>
        </JsonDiv>
      </div>
    </>
  );
}

JobScheduled.propTypes = {
  jobs: PropTypes.array,
  jobschema: PropTypes.object,
  theme: PropTypes.string,
};

export default JobScheduled;
