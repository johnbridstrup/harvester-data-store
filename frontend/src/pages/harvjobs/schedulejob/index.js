import { useEffect, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import validator from "@rjsf/validator-ajv8";
import { toast } from "react-toastify";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import { createJob, getJobSchemaById } from "features/harvjobs/harvjobSlice";
import { JsonDiv, LoaderDiv } from "components/styled";
import { Loader } from "utils/utils";
import { listHarvesters } from "features/harvester/harvesterSlice";
import { MAX_LIMIT, SUCCESS, THEME_MODES } from "features/base/constants";
import BackButton from "components/harvjobs/helpers";
import "./styles.css";
const ReactJson = lazy(() => import("@microlink/react-json-view"));
const Form = lazy(() => import("@rjsf/mui"));

function ScheduleJobView(props) {
  const { jobschema } = useSelector((state) => state.harvjobs);
  const { harvesters } = useSelector((state) => state.harvester);
  const { theme } = useSelector((state) => state.home);
  const { jobschemaId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      await dispatch(getJobSchemaById(jobschemaId));
      await dispatch(listHarvesters(MAX_LIMIT));
    })();
  }, [dispatch, jobschemaId]);

  const harvSchema = {
    type: "number",
    title: "Harv ID",
    enum: harvesters.map((x, _) => x.harv_id),
  };
  let copy = jobschema.schema || { properties: {}, required: [] };

  let schema = { ...copy, title: "Schedule A Job" };
  schema = JSON.parse(JSON.stringify(schema));
  schema["properties"]["harv_id"] = harvSchema;
  schema["required"]?.push("harv_id");
  const uiSchema = {
    "ui:submitButtonOptions": {
      submitText: "Schedule",
      norender: false,
      props: {
        disabled: false,
      },
    },
    targets: {
      items: {
        "ui:emptyValue": "",
      },
      "ui:help": "* this field is required",
    },
    harv_id: {
      "ui:help": "* this field is required",
    },
  };

  const handleScheduleJob = async (schemaData) => {
    let payload = { ...schemaData.formData };
    delete payload["harv_id"];
    const data = {
      jobtype: jobschema.jobtype,
      schema_version: jobschema.version,
      target: schemaData.formData.harv_id,
      payload: payload,
    };

    const res = await dispatch(createJob(data));
    if (res.payload?.status === SUCCESS) {
      toast.success(res.payload?.message);
      setTimeout(() => {
        navigate("/jobscheduler");
      }, 3000);
    } else {
      toast.error(res?.payload);
    }
  };

  return (
    <MainLayout>
      <div className="container">
        <Header title={"HDS Schedule Job"} className={`display-6 mt-4 mb-4`} />
        <BackButton theme={theme} mb={"mb-4"} />
        <div className="row mb-4">
          <div className="col-md-6">
            <JsonDiv style={{ height: "75vh" }}>
              <Suspense
                fallback={
                  <LoaderDiv>
                    <Loader size={25} />
                  </LoaderDiv>
                }
              >
                <ReactJson
                  src={schema}
                  collapsed={4}
                  enableClipboard
                  theme={
                    theme === THEME_MODES.DARK_THEME ? "monokai" : "monokaii"
                  }
                />
              </Suspense>
            </JsonDiv>
          </div>
          <div className="col-md-6 form-custom-theme">
            <Suspense
              fallback={
                <LoaderDiv>
                  <Loader size={25} />
                </LoaderDiv>
              }
            >
              <Form
                schema={schema}
                validator={validator}
                uiSchema={uiSchema}
                onSubmit={(data) => handleScheduleJob(data)}
                onError={(errors) => console.log(errors)}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

ScheduleJobView.propTypes = {};

export default ScheduleJobView;
