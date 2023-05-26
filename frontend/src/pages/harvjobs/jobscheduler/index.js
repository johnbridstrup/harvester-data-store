import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MainLayout from "components/layout/main";
import Header from "components/layout/header";
import {
  cacheSelectOptions,
  listJobTypes,
  resetSelectOptions,
} from "features/harvjobs/harvjobSlice";
import { MAX_LIMIT } from "features/base/constants";
import {
  transformJobSchemaOptions,
  transformJobTypeOptions,
} from "utils/utils";
import JobTypeSelect from "components/harvjobs/jobscheduler/JobTypeSelect";
import JobSchemaSelect from "components/harvjobs/jobscheduler/JobSchemaSelect";
import JobScheduled from "components/harvjobs/jobscheduler/JobScheduled";
import {
  getJobTypeSchema,
  getScheduledJobForm,
  queryScheduledJobs,
} from "features/jobscheduler/jobschedulerSlice";
import "./styles.css";

function JobSchedulerView(props) {
  const [selectedJobType, setSelectedJobType] = useState(null);
  const [selectedJobSchema, setSelectedJobSchema] = useState(null);
  const [schemaOptions, setSchemaOptions] = useState([]);
  const {
    internal: { jtype, schema },
  } = useSelector((state) => state.harvjobs);
  const { jobtypeschema, formbuilder, scheduledjobs } = useSelector(
    (state) => state.jobscheduler
  );
  const { theme } = useSelector((state) => state.home);
  const dispatch = useDispatch();
  const jobtypeOptions = transformJobTypeOptions(
    Object.keys(jobtypeschema.jobs || {})
  );

  useEffect(() => {
    dispatch(listJobTypes(MAX_LIMIT));
    dispatch(getJobTypeSchema());
  }, [dispatch]);

  useEffect(() => {
    (async () => {
      if (jtype && schema) {
        setSelectedJobType((current) => jtype);
        setSelectedJobSchema((current) => schema);
        const url =
          jobtypeschema?.jobs?.[jtype?.value]?.[schema?.value]?.["url"];
        if (url) dispatch(getScheduledJobForm(url));
        dispatch(
          queryScheduledJobs({
            jobtype: jtype?.value,
            schema_version: schema?.value,
          })
        );
      }
    })();
  }, [dispatch, jobtypeschema, jtype, schema]);

  const handleJobTypeSelect = async (newValue, actionMeta) => {
    setSelectedJobType((current) => newValue);
    if (newValue && newValue.hasOwnProperty("value")) {
      const options = transformJobSchemaOptions(
        Object.keys(jobtypeschema.jobs[newValue.value] || {})
      );
      setSchemaOptions((current) => options);
      setSelectedJobSchema((current) => options[0]);
      const url =
        jobtypeschema?.jobs?.[newValue.value]?.[options[0]?.value]?.["url"];
      dispatch(getScheduledJobForm(url));
      dispatch(cacheSelectOptions({ jtype: newValue, schema: options[0] }));
      dispatch(
        queryScheduledJobs({
          jobtype: newValue.value,
          schema_version: options[0]?.value,
        })
      );
    } else {
      setSelectedJobSchema(null);
      dispatch(resetSelectOptions());
      dispatch(cacheSelectOptions({}));
    }
  };

  const handleJobSchemaSelect = async (newValue, actionMeta) => {
    setSelectedJobSchema((current) => newValue);
    if (newValue && newValue.hasOwnProperty("value")) {
      const url =
        jobtypeschema?.jobs?.[selectedJobType?.value]?.[newValue?.value]?.[
          "url"
        ];
      dispatch(getScheduledJobForm(url));
      dispatch(
        queryScheduledJobs({
          jobtype: selectedJobType?.value,
          schema_version: newValue.value,
        })
      );
      dispatch(
        cacheSelectOptions({ jtype: selectedJobType, schema: newValue })
      );
    }
  };

  return (
    <MainLayout>
      <div className="container">
        <Header title={"HDS Job Scheduler"} className={`display-6 mt-4 mb-4`} />
        <div className="row mb-4">
          <div className="col-lg-3 col-md-4 col-sm-12">
            <JobTypeSelect
              jobtypeOptions={jobtypeOptions}
              handleJobTypeSelect={handleJobTypeSelect}
              selectedJobType={selectedJobType}
              theme={theme}
            />
          </div>
          <div className="col-lg-9 col-md-8 col-sm-12">
            <JobSchemaSelect
              schemaOptions={schemaOptions}
              handleJobSchemaSelect={handleJobSchemaSelect}
              selectedJobSchema={selectedJobSchema}
              theme={theme}
              url={
                jobtypeschema?.jobs?.[selectedJobType?.value]?.[
                  selectedJobSchema?.value
                ]?.["url"]
              }
            />
          </div>
        </div>
        <div className="row mb-4">
          <JobScheduled
            jobs={scheduledjobs}
            jobschema={formbuilder.form}
            theme={theme}
          />
        </div>
      </div>
    </MainLayout>
  );
}

JobSchedulerView.propTypes = {};

export default JobSchedulerView;
