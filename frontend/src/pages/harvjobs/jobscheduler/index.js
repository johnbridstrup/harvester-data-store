import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MainLayout from "../../../components/layout/main";
import Header from "../../../components/layout/header";
import {
  getJobSchemaById,
  listJobTypes,
  queryJobs,
  resetSelectOptions,
} from "../../../features/harvjobs/harvjobSlice";
import { MAX_LIMIT } from "../../../features/base/constants";
import {
  transformJobSchemaOptions,
  transformJobTypeOptions,
} from "../../../utils/utils";
import "./styles.css";
import harvjobService from "../../../features/harvjobs/harvjobService";
import JobTypeSelect from "../../../components/harvjobs/jobscheduler/JobTypeSelect";
import JobSchemaSelect from "../../../components/harvjobs/jobscheduler/JobSchemaSelect";
import JobScheduled from "../../../components/harvjobs/jobscheduler/JobScheduled";

function JobSchedulerView(props) {
  const [selectedJobType, setSelectedJobType] = useState(null);
  const [selectedJobSchema, setSelectedJobSchema] = useState(null);
  const [schemaOptions, setSchemaOptions] = useState([]);
  const { jobtypes, jobschema, jobs } = useSelector((state) => state.harvjobs);
  const dispatch = useDispatch();
  const jobtypeOptions = transformJobTypeOptions(jobtypes);

  useEffect(() => {
    (async () => {
      await dispatch(listJobTypes(MAX_LIMIT));
    })();
  }, [dispatch]);

  const handleJobTypeSelect = async (newValue, actionMeta) => {
    setSelectedJobType((current) => newValue);
    if (newValue && newValue.hasOwnProperty("value")) {
      try {
        const res = await harvjobService.queryJobSchema({
          jobtype__name: newValue.value,
          limit: MAX_LIMIT,
        });
        const options = transformJobSchemaOptions(res.results);
        setSchemaOptions((current) => options);
        setSelectedJobSchema((current) => options[0]);
        await dispatch(getJobSchemaById(res.results[0]?.id));
        await dispatch(queryJobs({ schema__id: options[0]?.value }));
      } catch (error) {
        setSchemaOptions((current) => []);
        setSelectedJobSchema(null);
      }
    } else {
      setSelectedJobSchema(null);
      dispatch(resetSelectOptions());
    }
  };

  const handleJobSchemaSelect = async (newValue, actionMeta) => {
    setSelectedJobSchema((current) => newValue);
    if (newValue && newValue.hasOwnProperty("value")) {
      await Promise.all([
        dispatch(getJobSchemaById(newValue.value)),
        dispatch(queryJobs({ schema__id: newValue.value })),
      ]);
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
            />
          </div>
          <div className="col-lg-9 col-md-8 col-sm-12">
            <JobSchemaSelect
              schemaOptions={schemaOptions}
              handleJobSchemaSelect={handleJobSchemaSelect}
              selectedJobSchema={selectedJobSchema}
            />
          </div>
        </div>
        <div className="row mb-4">
          <JobScheduled jobs={jobs} jobschema={jobschema} />
        </div>
      </div>
    </MainLayout>
  );
}

JobSchedulerView.propTypes = {};

export default JobSchedulerView;
