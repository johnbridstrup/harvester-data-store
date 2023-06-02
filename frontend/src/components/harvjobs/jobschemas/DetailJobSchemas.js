import moment from "moment";
import { lazy, Suspense } from "react";
import { useSelector } from "react-redux";
import { darkThemeClass, Loader } from "utils/utils";
import { JsonDiv, LoaderDiv } from "components/styled";
const ReactJson = lazy(() => import("@microlink/react-json-view"));

function DetailJobSchemas(props) {
  const { jobschema } = useSelector((state) => state.harvjobs);
  const { theme } = useSelector((state) => state.home);
  const cardtheme = darkThemeClass("dt-card-theme", theme);
  return (
    <div className="mb-4">
      <div
        className={`card card-body mb-4 ${cardtheme}`}
        data-testid="job-schema"
      >
        <div className="row">
          <div className="col-md-3 mb-2">
            <div className="f-w-600">ID</div>
            <div>{jobschema.id}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Version</div>
            <div>{jobschema.version}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Job Type</div>
            <div>{jobschema.jobtype}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Comment</div>
            <div>{jobschema.comment}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Created At</div>
            <div>{moment(jobschema.created).format("LLLL")}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Updated At</div>
            <div>{moment(jobschema.lastModified).format("LLLL")}</div>
          </div>
        </div>
      </div>
      <JsonDiv>
        <Suspense
          fallback={
            <LoaderDiv>
              <Loader size={25} />
            </LoaderDiv>
          }
        >
          <ReactJson
            src={jobschema.schema || {}}
            collapsed={4}
            enableClipboard
            theme={cardtheme ? "monokai" : "monokaii"}
          />
        </Suspense>
      </JsonDiv>
    </div>
  );
}

DetailJobSchemas.propTypes = {};

export default DetailJobSchemas;
