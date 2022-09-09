import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  copiedUrl,
  extractDateFromString,
  paramsToObject,
  pushState,
  timeStampFormat,
  transformCodeOptions,
  transformFruitOptions,
  transformHarvOptions,
  transformLocOptions,
  transformTzOptions,
  transformUserOptions,
  translateCodeOptions,
  translateFruitOptions,
  translateHarvOptions,
  translateLocOptions,
  translateUserOptions,
  validateQueryObj,
} from "../../utils/utils";
import {
  copyQueryUrl,
  createNotification,
  queryErrorReport,
  timezoneUpdate,
} from "../../features/errorreport/errorreportSlice";
import { DivTotalReport } from "../styled";
import timezones from "../../utils/timezones";
import NotificationModal from "../modals/NotificationModal";
import { FormQuery } from "./ErrorHelpers";
import { HoverTabular } from "./ErrorHelpers";

function ErrorReportQuery(props) {
  const [selectedHarvId, setSelectedHarvId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedTimezone, setSelectedTimezone] = useState(null);
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [selectedCode, setSelectedCode] = useState(null);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [datesQuery, setDatesQuery] = useState({
    start_time: "",
    end_time: "",
  });
  const [traceback, setTraceback] = useState("");
  const [generic, setGeneric] = useState("");
  const { count, hovered } = useSelector((state) => state.errorreport);
  const { harvesters } = useSelector((state) => state.harvester);
  const { locations } = useSelector((state) => state.location);
  const { fruits } = useSelector((state) => state.fruit);
  const { exceptioncodes } = useSelector((state) => state.exceptioncode);
  const { users } = useSelector((state) => state.user);
  const harvesterOptions = transformHarvOptions(harvesters);
  const locationOptions = transformLocOptions(locations);
  const timezoneOptions = transformTzOptions(timezones);
  const fruitOptions = transformFruitOptions(fruits);
  const codeOptions = transformCodeOptions(exceptioncodes);
  const usersOptions = transformUserOptions(users);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search } = useLocation();
  const notifyRef = useRef();

  useEffect(() => {
    const paramsObj = paramsToObject(search);
    if (paramsObj.harv_ids) {
      let harv_ids = paramsObj.harv_ids.split(",").map((harv_id, index) => {
        return { value: Number(harv_id), label: Number(harv_id) };
      });
      setSelectedHarvId((current) => harv_ids);
    }
    if (paramsObj.locations) {
      let locations = paramsObj.locations.split(",").map((loc, index) => {
        return { value: loc, label: loc };
      });
      setSelectedLocation((current) => locations);
    }
    if (paramsObj.fruits) {
      let fruits = paramsObj.fruits.split(",").map((fruit, index) => {
        return { value: fruit, label: fruit };
      });
      setSelectedFruit((current) => fruits);
    }
    if (paramsObj.codes) {
      let codes = paramsObj.codes.split(",").map((code, index) => {
        return { value: code, label: code };
      });
      setSelectedCode((current) => codes);
    }
    if (paramsObj.traceback) {
      setTraceback((current) => paramsObj.traceback);
    }
    if (paramsObj.start_time) {
      setDatesQuery((current) => {
        return {
          ...current,
          start_time: paramsObj.start_time,
        };
      });
    }
    if (paramsObj.end_time) {
      setDatesQuery((current) => {
        return {
          ...current,
          end_time: paramsObj.end_time,
        };
      });
    }
    if (paramsObj.tz) {
      let tzObj = { value: paramsObj.tz, label: paramsObj.tz };
      setSelectedTimezone((current) => tzObj);
    }
    if (paramsObj.generic) {
      setGeneric((current) => paramsObj.generic);
    }
  }, [search]);

  const handleHarvestSelect = (newValue, actionMeta) => {
    setSelectedHarvId((current) => newValue);
  };

  const handleLocationSelect = (newValue, actionMeta) => {
    setSelectedLocation((current) => newValue);
  };

  const handleTimezoneSelect = (newValue, actionMeta) => {
    setSelectedTimezone((current) => newValue);
    dispatch(timezoneUpdate(newValue.value));
  };

  const handleFruitSelect = (newValue, actionMeta) => {
    setSelectedFruit((current) => newValue);
  };

  const handleCodeSelect = (newValue, actionMeta) => {
    setSelectedCode((current) => newValue);
  };

  const handleTracebackChange = (e) => {
    setTraceback(e.target.value);
  };

  const handleRecipientSelect = (newValue, actionMeta) => {
    setSelectedRecipient((current) => newValue);
  };

  const handleGenericChange = (e) => {
    setGeneric(e.target.value);
  };

  const buildQueryObj = () => {
    let queryObj = {};
    if (datesQuery.start_time) {
      queryObj["start_time"] = timeStampFormat(
        extractDateFromString(datesQuery.start_time)
      );
    }
    if (datesQuery.end_time) {
      queryObj["end_time"] = timeStampFormat(
        extractDateFromString(datesQuery.end_time)
      );
    }
    if (selectedHarvId && selectedHarvId.length > 0) {
      queryObj["harv_ids"] = translateHarvOptions(selectedHarvId);
    }
    if (selectedLocation && selectedLocation.length > 0) {
      queryObj["locations"] = translateLocOptions(selectedLocation);
    }
    if (selectedTimezone && selectedTimezone.hasOwnProperty("value")) {
      queryObj["tz"] = selectedTimezone.value;
    }
    if (selectedFruit && selectedFruit.length > 0) {
      queryObj["fruits"] = translateFruitOptions(selectedFruit);
    }
    if (selectedCode && selectedCode.length > 0) {
      queryObj["codes"] = translateCodeOptions(selectedCode);
    }
    if (traceback) {
      queryObj["traceback"] = traceback;
    }
    if (generic) {
      queryObj["generic"] = generic;
    }
    return queryObj;
  };

  const handleFormQuerySubmit = async (e) => {
    e.preventDefault();
    let queryObj = buildQueryObj();
    await dispatch(queryErrorReport(queryObj));
    dispatch(copyQueryUrl(copiedUrl(queryObj)));
    pushState(queryObj, false);
  };

  const handleDateChange = (e) => {
    setDatesQuery((current) => {
      return { ...current, [e.target.name]: e.target.value };
    });
  };

  const handleGenPareto = async () => {
    let queryObj = buildQueryObj();
    let params = new URLSearchParams(queryObj);
    pushState(queryObj, true);
    let routeto = `/errorreports/view/pareto/?aggregate_query=code__name&${params.toString()}`;
    navigate(routeto);
  };

  const handleModalPopUp = () => {
    notifyRef.current.click();
  };

  const handleNotificationCreate = async () => {
    let queryObj = buildQueryObj();
    if (selectedRecipient && selectedRecipient.length > 0) {
      let recipients = translateUserOptions(selectedRecipient);
      let isValid = validateQueryObj(queryObj);
      if (!isValid) {
        toast.error(
          "You must include at least one query to create a notification"
        );
      } else {
        queryObj["recipients"] = recipients;
        await dispatch(createNotification(queryObj));
        toast.success("Notification created successfully.");
        handleModalPopUp();
      }
    }
  };

  return (
    <>
      <div className="row">
        <div className="col-lg-10 col-md-8 col-sm-12">
          <div>
            <FormQuery
              codeOptions={codeOptions}
              datesQuery={datesQuery}
              fruitOptions={fruitOptions}
              generic={generic}
              handleCodeSelect={handleCodeSelect}
              handleDateChange={handleDateChange}
              handleFormQuerySubmit={handleFormQuerySubmit}
              handleFruitSelect={handleFruitSelect}
              handleGenPareto={handleGenPareto}
              handleGenericChange={handleGenericChange}
              handleHarvestSelect={handleHarvestSelect}
              handleLocationSelect={handleLocationSelect}
              handleModalPopUp={handleModalPopUp}
              handleTimezoneSelect={handleTimezoneSelect}
              handleTracebackChange={handleTracebackChange}
              harvesterOptions={harvesterOptions}
              locationOptions={locationOptions}
              notifyRef={notifyRef}
              selectedCode={selectedCode}
              selectedFruit={selectedFruit}
              selectedHarvId={selectedHarvId}
              selectedLocation={selectedLocation}
              selectedTimezone={selectedTimezone}
              timezoneOptions={timezoneOptions}
              traceback={traceback}
            />
          </div>
        </div>
        <div className="col-lg-2 col-md-4 col-sm-12">
          <DivTotalReport className="total-report">
            <span>Total Report</span>
            <span>{count}</span>
          </DivTotalReport>
          <HoverTabular hoverObj={hovered} />
        </div>
      </div>
      <NotificationModal
        usersOptions={usersOptions}
        handleRecipientSelect={handleRecipientSelect}
        handleSubmit={handleNotificationCreate}
        selectedRecipient={selectedRecipient}
      />
    </>
  );
}

ErrorReportQuery.propTypes = {};

export default ErrorReportQuery;
