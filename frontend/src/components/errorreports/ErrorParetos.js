import { lazy, Suspense, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { generatePareto } from "features/errorreport/errorreportSlice";
import {
  aggregateOptions,
  appendCodeName,
  extractDateFromString,
  handleSelectFactory,
  Loader,
  paramsToObject,
  timeStampFormat,
  transformCodeOptions,
  transformFruitOptions,
  transformHarvOptions,
  transformLocOptions,
  transformTzOptions,
  translateCodeOptions,
  translateFruitOptions,
  translateHarvOptions,
  translateLocOptions,
  uuid,
} from "utils/utils";
import timezones from "utils/timezones";
import { LoaderDiv, SidePane } from "../styled";
import { ParetoForm, ParetoTabular } from "./ErrorHelpers";
import { CopyBuildConfig } from "../copytoclipboard/CopyToClipboard";
const ParetoPlot = lazy(() => import("../plotly/ParetoPlot"));

function ErrorParetos(props) {
  const [open, setOpen] = useState(false);
  const [selectedAggregate, setSelectedAggregate] = useState(null);
  const [paretoArr, setParetoArr] = useState([]);
  const [selectedHarvId, setSelectedHarvId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedTimezone, setSelectedTimezone] = useState(null);
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [selectedCode, setSelectedCode] = useState(null);
  const [fieldData, setFieldData] = useState({
    start_time: "",
    end_time: "",
    traceback: "",
    generic: "",
    is_emulator: "0",
    handled: "",
    primary: true,
  });
  const { paretos, loading } = useSelector((state) => state.errorreport);
  const { harvesters } = useSelector((state) => state.harvester);
  const { locations } = useSelector((state) => state.location);
  const { fruits } = useSelector((state) => state.fruit);
  const { exceptioncodes } = useSelector((state) => state.exceptioncode);
  const harvesterOptions = transformHarvOptions(harvesters);
  const locationOptions = transformLocOptions(locations);
  const timezoneOptions = transformTzOptions(timezones);
  const fruitOptions = transformFruitOptions(fruits);
  const codeOptions = transformCodeOptions(exceptioncodes);
  const dispatch = useDispatch();
  const { search } = useLocation();
  const paramsObj = paramsToObject(search);
  const lg = useMediaQuery({ query: "(min-width: 1170px)" });
  const md = useMediaQuery({ query: "(min-width: 850px)" });

  useEffect(() => {
    const paramsObj = paramsToObject(search);
    const dataArr = paretos.slice();
    dataArr.sort((a, b) =>
      a.count > b.count ? -1 : b.count > a.count ? 1 : 0
    );
    const xlabels = dataArr.map((pareto, index) => {
      return pareto.value;
    });
    const ydata = dataArr.map((pareto, index) => {
      return pareto.count;
    });
    const option = aggregateOptions.find(
      (x, i) => x.value === paramsObj.aggregate_query
    );
    let paretoObj = {
      id: uuid(),
      paretos: { xlabels, ydata },
      aggregate_query: paramsObj.aggregate_query,
      chart_title: option?.label,
    };
    let arr = [paretoObj];
    setParetoArr((current) => arr);

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
  }, [search, paretos, exceptioncodes]);

  const handleHarvestSelect = handleSelectFactory(setSelectedHarvId);
  const handleLocationSelect = handleSelectFactory(setSelectedLocation);
  const handleTimezoneSelect = handleSelectFactory(setSelectedTimezone);
  const handleFruitSelect = handleSelectFactory(setSelectedFruit);
  const handleCodeSelect = handleSelectFactory(setSelectedCode);
  const handleAggreSelect = handleSelectFactory(setSelectedAggregate);

  const handleFieldChange = (e) => {
    if (e.target.name === "primary") {
      setFieldData((current) => {
        return { ...current, primary: e.target.checked };
      });
    } else {
      setFieldData((current) => {
        return { ...current, [e.target.name]: e.target.value };
      });
    }
  };

  const handleSideClick = () => {
    setOpen(!open);
  };

  const paretoApiReq = async (aggregateObj) => {
    const option = aggregateOptions.find(
      (x, i) => x.value === aggregateObj.aggregate_query
    );
    let chart_title = option?.label;
    const res = await dispatch(generatePareto(aggregateObj));
    if (res.type === "errorreport/generatePareto/fulfilled") {
      const dataArr = res?.payload.slice();
      dataArr.sort((a, b) =>
        a.count > b.count ? -1 : b.count > a.count ? 1 : 0
      );
      const xlabels = dataArr.map((pareto, index) => {
        return pareto.value;
      });
      const ydata = dataArr.map((pareto, index) => {
        return pareto.count;
      });
      let paretoObj = {
        id: uuid(),
        paretos: { xlabels, ydata },
        aggregate_query: aggregateObj.aggregate_query,
        chart_title,
      };
      let arr = paretoArr.slice();
      let exist = arr.find((x, i) => x.chart_title === chart_title);
      if (!exist) {
        arr.push(paretoObj);
      }
      setParetoArr((current) => arr);
    }
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

  const handleBuildPareto = async (e) => {
    e.preventDefault();
    let queryObj = buildQueryObj();
    if (selectedAggregate && selectedAggregate.hasOwnProperty("value")) {
      queryObj["aggregate_query"] = selectedAggregate.value;
    } else {
      queryObj["aggregate_query"] = "code__name";
    }
    if (fieldData.primary) {
      queryObj["primary"] = fieldData.primary;
    }
    await paretoApiReq(queryObj);
  };

  const handleDeletePareto = (chart) => {
    let arr = paretoArr.slice();
    let index = arr.findIndex((x, i) => x.id === chart.id);
    arr.splice(index, 1);
    setParetoArr((current) => arr);
  };

  const className =
    open && lg
      ? "col-md-6"
      : !open && lg
      ? "col-md-4"
      : open && md
      ? "col-md-12"
      : !open && md
      ? "col-md-6"
      : "col-md-12";

  return (
    <div>
      <ParetoForm
        handleAggreSelect={handleAggreSelect}
        handleSubmit={handleBuildPareto}
        selectedAggregate={selectedAggregate}
        codeOptions={codeOptions}
        fieldData={fieldData}
        fruitOptions={fruitOptions}
        handleCodeSelect={handleCodeSelect}
        handleFieldChange={handleFieldChange}
        handleFruitSelect={handleFruitSelect}
        handleHarvestSelect={handleHarvestSelect}
        handleLocationSelect={handleLocationSelect}
        handleTimezoneSelect={handleTimezoneSelect}
        harvesterOptions={harvesterOptions}
        locationOptions={locationOptions}
        selectedCode={selectedCode}
        selectedFruit={selectedFruit}
        selectedHarvId={selectedHarvId}
        selectedLocation={selectedLocation}
        selectedTimezone={selectedTimezone}
        timezoneOptions={timezoneOptions}
      />
      <div className="mb-2">
        <span onClick={handleSideClick} className="btn cursor">
          {open ? "Hide" : "Show"} Parameters
        </span>
        <CopyBuildConfig paramsObj={paramsObj} paretoArr={paretoArr} />
      </div>
      <div className="sidenav">
        <SidePane open={open}>
          <div className="sidecontent">
            {open && <ParetoTabular paramsObj={paramsObj} />}
          </div>
        </SidePane>
      </div>
      {loading ? (
        <LoaderDiv>
          <Loader size={50}></Loader>
        </LoaderDiv>
      ) : (
        <div className={`row ${open ? "mainchart" : "minus-side"}`}>
          {paretoArr.map((obj, _) => (
            <div key={obj.id} className={`${className} plot-div`}>
              <Suspense
                fallback={
                  <LoaderDiv>
                    <Loader size={25} />
                  </LoaderDiv>
                }
              >
                <ParetoPlot
                  xlabels={obj.paretos.xlabels}
                  ydata={obj.paretos.ydata}
                  chart_title={obj.chart_title}
                />
              </Suspense>
              <span
                onClick={() => handleDeletePareto(obj)}
                className="delete-icon"
              >
                <i className="las la-times"></i>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

ErrorParetos.propTypes = {};

export default ErrorParetos;
