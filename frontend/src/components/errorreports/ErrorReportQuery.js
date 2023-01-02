import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  appendCodeName,
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
} from "utils/utils";
import {
  cacheParamsObj,
  copyQueryUrl,
  createNotification,
  queryErrorReport,
  timezoneUpdate,
} from "features/errorreport/errorreportSlice";
import { DivTotalReport } from "../styled";
import timezones from "utils/timezones";
import NotificationModal from "../modals/NotificationModal";
import { FormQuery } from "./ErrorHelpers";
import { HoverTabular } from "./ErrorHelpers";
import { SUCCESS } from "features/base/constants";

function ErrorReportQuery(props) {
  const [selectedHarvId, setSelectedHarvId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedTimezone, setSelectedTimezone] = useState(null);
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [selectedCode, setSelectedCode] = useState(null);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [fieldData, setFieldData] = useState({
    start_time: "",
    end_time: "",
    traceback: "",
    generic: "",
    is_emulator: "0",
    handled: "",
  });
  const {
    pagination: { count },
    internal: { hovered },
  } = useSelector((state) => state.errorreport);
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
      let codes = paramsObj.codes.split(",");
      let codenames = appendCodeName(codes, exceptioncodes);
      setSelectedCode((current) => codenames);
    }
    if (paramsObj.traceback) {
      setFieldData((current) => {
        return { ...current, traceback: paramsObj.traceback };
      });
    }
    if (paramsObj.start_time) {
      setFieldData((current) => {
        return {
          ...current,
          start_time: paramsObj.start_time,
        };
      });
    }
    if (paramsObj.end_time) {
      setFieldData((current) => {
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
      setFieldData((current) => {
        return { ...current, generic: paramsObj.generic };
      });
    }
    if (paramsObj.is_emulator) {
      setFieldData((current) => {
        return { ...current, is_emulator: paramsObj.is_emulator };
      });
    }
    if (paramsObj.handled) {
      setFieldData((current) => {
        return { ...current, handled: paramsObj.handled };
      });
    }
  }, [search, exceptioncodes]);

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

  const handleRecipientSelect = (newValue, actionMeta) => {
    setSelectedRecipient((current) => newValue);
  };

  const handleFieldChange = (e) => {
    setFieldData((current) => {
      return { ...current, [e.target.name]: e.target.value };
    });
  };

  const buildQueryObj = () => {
    let queryObj = {};
    if (fieldData.start_time) {
      queryObj["start_time"] = timeStampFormat(
        extractDateFromString(fieldData.start_time)
      );
    }
    if (fieldData.end_time) {
      queryObj["end_time"] = timeStampFormat(
        extractDateFromString(fieldData.end_time)
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
    if (fieldData.traceback) {
      queryObj["traceback"] = fieldData.traceback;
    }
    if (fieldData.generic) {
      queryObj["generic"] = fieldData.generic;
    }
    if (fieldData.is_emulator) {
      queryObj["is_emulator"] = fieldData.is_emulator;
    }
    if (fieldData.handled) {
      queryObj["handled"] = fieldData.handled;
    }
    return queryObj;
  };

  const handleFormQuerySubmit = async (e) => {
    e.preventDefault();
    let queryObj = buildQueryObj();
    await dispatch(queryErrorReport(queryObj));
    dispatch(copyQueryUrl(copiedUrl(queryObj)));
    dispatch(cacheParamsObj(queryObj));
    pushState(queryObj, false);
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
        delete queryObj["start_time"];
        delete queryObj["end_time"];
        const res = await dispatch(createNotification(queryObj));
        if (res?.payload?.status === SUCCESS) {
          toast.success(res?.payload?.message);
          handleModalPopUp();
        } else {
          toast.error(res?.payload);
        }
      }
    }
  };

  const queryColClassName =
    hovered?.type === "CODE"
      ? "col-lg-6 col-md-6 col-sm-12"
      : "col-lg-9 col-md-8 col-sm-12";
  const hoverColClassName =
    hovered?.type === "CODE"
      ? "col-lg-6 col-md-6 col-sm-12"
      : "col-lg-3 col-md-4 col-sm-12";

  return (
    <>
      <div className="row">
        <div className={queryColClassName}>
          <div>
            <FormQuery
              codeOptions={codeOptions}
              fruitOptions={fruitOptions}
              fieldData={fieldData}
              handleFieldChange={handleFieldChange}
              handleCodeSelect={handleCodeSelect}
              handleFormQuerySubmit={handleFormQuerySubmit}
              handleFruitSelect={handleFruitSelect}
              handleGenPareto={handleGenPareto}
              handleHarvestSelect={handleHarvestSelect}
              handleLocationSelect={handleLocationSelect}
              handleModalPopUp={handleModalPopUp}
              handleTimezoneSelect={handleTimezoneSelect}
              harvesterOptions={harvesterOptions}
              locationOptions={locationOptions}
              notifyRef={notifyRef}
              selectedCode={selectedCode}
              selectedFruit={selectedFruit}
              selectedHarvId={selectedHarvId}
              selectedLocation={selectedLocation}
              selectedTimezone={selectedTimezone}
              timezoneOptions={timezoneOptions}
            />
          </div>
        </div>
        <div className={hoverColClassName}>
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
