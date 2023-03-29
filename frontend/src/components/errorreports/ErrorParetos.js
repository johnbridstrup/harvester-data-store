import { lazy, Suspense, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { generatePareto } from "features/errorreport/errorreportSlice";
import {
  aggregateOptions,
  buildQueryObj,
  darkThemeClass,
  handleSelectFactory,
  Loader,
  mapParamsObject,
  paramsToObject,
  pushState,
  sortReduceParetos,
  transformCodeOptions,
  transformFruitOptions,
  transformHarvOptions,
  transformLocOptions,
  transformTzOptions,
  uuid,
} from "utils/utils";
import timezones from "utils/timezones";
import { PushStateEnum } from "features/base/constants";
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
  const { theme } = useSelector((state) => state.home);
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
    mapParamsObject(
      paramsObj,
      exceptioncodes,
      setSelectedHarvId,
      setSelectedLocation,
      setSelectedFruit,
      setSelectedCode,
      setFieldData,
      setSelectedTimezone
    );
  }, [search, exceptioncodes]);

  useEffect(() => {
    const paramsObj = paramsToObject(search);
    const { xlabels, ydata } = sortReduceParetos(paretos.slice());
    const option = aggregateOptions.find(
      (x, _) => x.value === paramsObj.aggregate_query
    );
    let paretoObj = {
      id: uuid(),
      paretos: { xlabels, ydata },
      aggregate_query: paramsObj.aggregate_query,
      chart_title: option?.label,
    };
    let arr = [paretoObj];
    setParetoArr((current) => arr);
  }, [search, paretos]);

  const handleHarvestSelect = handleSelectFactory(setSelectedHarvId);
  const handleLocationSelect = handleSelectFactory(setSelectedLocation);
  const handleTimezoneSelect = handleSelectFactory(setSelectedTimezone);
  const handleFruitSelect = handleSelectFactory(setSelectedFruit);
  const handleCodeSelect = handleSelectFactory(setSelectedCode);
  const handleAggreSelect = handleSelectFactory(setSelectedAggregate);

  const handleFieldChange = (e) => {
    let name = e.target.name;
    let value = name === "primary" ? e.target.checked : e.target.value;
    setFieldData((current) => {
      return { ...current, [name]: value };
    });
  };

  const handleSideClick = () => {
    setOpen(!open);
  };

  const paretoApiReq = async (aggregateObj) => {
    const option = aggregateOptions.find(
      (x, _) => x.value === aggregateObj.aggregate_query
    );
    let chart_title = option?.label;
    const res = await dispatch(generatePareto(aggregateObj));
    if (res.type === "errorreport/generatePareto/fulfilled") {
      const dataArr = res?.payload?.slice() || [];
      const { xlabels, ydata } = sortReduceParetos(dataArr);
      let paretoObj = {
        id: uuid(),
        paretos: { xlabels, ydata },
        aggregate_query: aggregateObj.aggregate_query,
        chart_title,
      };
      let arr = paretoArr.slice();
      let exist = arr.find((x, _) => x.chart_title === chart_title);
      if (!exist) {
        arr.push(paretoObj);
      }
      setParetoArr((current) => arr);
    }
  };

  const handleBuildPareto = async (e) => {
    e.preventDefault();
    let queryObj = buildQueryObj(
      fieldData,
      selectedHarvId,
      selectedLocation,
      selectedTimezone,
      selectedFruit,
      selectedCode
    );
    if (selectedAggregate && selectedAggregate.hasOwnProperty("value")) {
      queryObj["aggregate_query"] = selectedAggregate.value;
    } else {
      queryObj["aggregate_query"] = "code__name";
    }
    if (fieldData.primary) {
      queryObj["primary"] = fieldData.primary;
    }
    pushState(queryObj, PushStateEnum.BUILDCHART);
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

  const icon = darkThemeClass("dt-delete-icon", theme);
  const btn = darkThemeClass("btn-dark", theme);

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
        theme={theme}
      />
      <div className="mb-2">
        <span onClick={handleSideClick} className={`btn cursor ${btn}`}>
          {open ? "Hide" : "Show"} Parameters
        </span>
        <CopyBuildConfig
          paramsObj={paramsObj}
          paretoArr={paretoArr}
          theme={theme}
        />
      </div>
      <div className="sidenav">
        <SidePane open={open}>
          <div className="sidecontent">
            {open && <ParetoTabular paramsObj={paramsObj} theme={theme} />}
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
                  theme={theme}
                />
              </Suspense>
              <span
                onClick={() => handleDeletePareto(obj)}
                className={`delete-icon ${icon}`}
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
