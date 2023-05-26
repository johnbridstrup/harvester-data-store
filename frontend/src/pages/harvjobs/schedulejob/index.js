import { useEffect, lazy, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import validator from "@rjsf/validator-ajv8";
import { toast } from "react-toastify";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import {
  getJobTypeSchema,
  getScheduledJobForm,
} from "features/jobscheduler/jobschedulerSlice";
import { createScheduledJob } from "features/jobscheduler/jobschedulerSlice";
import { LoaderDiv } from "components/styled";
import { Loader, paramsToObject } from "utils/utils";
import { FULLFILLED_PROMISE } from "features/base/constants";
import BackButton from "components/harvjobs/helpers";
import "./styles.css";
const Form = lazy(() => import("@rjsf/mui"));

function ScheduleJobView(props) {
  const { formbuilder } = useSelector((state) => state.jobscheduler);
  const { theme } = useSelector((state) => state.home);
  const { search } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const paramsObj = paramsToObject(search);
      const res = await dispatch(getJobTypeSchema());
      if (res.type === FULLFILLED_PROMISE.jobtypeschema) {
        const url =
          res.payload?.jobs?.[paramsObj.jobtype]?.[paramsObj.schema_version]?.[
            "url"
          ];
        if (url) dispatch(getScheduledJobForm(url));
      }
    })();
  }, [dispatch, search]);

  const schema = formbuilder.form || {
    properties: {},
    required: [],
    title: "Schedule A Job",
  };

  const uiSchema = {
    "ui:submitButtonOptions": {
      submitText: "Schedule",
    },
  };

  const handleScheduleJob = async (schemaData) => {
    const data = {
      url: formbuilder.submit,
      data: { ...schemaData.formData },
    };

    const res = await dispatch(createScheduledJob(data));
    if (res.type === FULLFILLED_PROMISE.schedulejob) {
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
          <div className="col form-custom-theme">
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
