import { useState, useEffect, lazy, Suspense, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Editor from "@monaco-editor/react";
import { handleDownload } from "utils/services";
import {
  buildQueryObj,
  handleSelectFactory,
  Loader,
  mapParamsObject,
  monacoOptions,
  paramsToObject,
  robotInError,
  timeStampFormat,
  transformCodeOptions,
  transformFruitOptions,
  transformHarvOptions,
  transformLocOptions,
  transformTzOptions,
  transformUserOptions,
  translateUserOptions,
  validateQueryObj,
} from "utils/utils";
import DownloadModal from "../modals/DownloadModal";
import {
  Container,
  LoaderDiv,
  NavMainTabSpan,
  NavTabItem,
  NavTabs,
  NavTabSpan,
  TabContent,
} from "../styled";
import ErrorReportDetailTable from "../tables/ErrorReportDetailTable";
import ServiceTable from "../tables/ServiceTable";
import TimeTable from "../tables/TimeTable";
import { ExceptTabular, RightButtonGroup } from "./ErrorHelpers";
import CreateNotifModal from "../modals/CreateNotifModal";
import timezones from "utils/timezones";
import { listHarvesters } from "features/harvester/harvesterSlice";
import { listLocations } from "features/location/locationSlice";
import { listFruits } from "features/fruit/fruitSlice";
import { listCodes } from "features/excecode/codeSlice";
import { listUsers } from "features/user/userSlice";
import { MAX_LIMIT, SUCCESS, THEME_MODES } from "features/base/constants";
import { createNotification } from "features/errorreport/errorreportSlice";
const ChronyInfoPlot = lazy(() => import("../plotly/ChronyInfoPlot"));
const ErrorReportJson = lazy(() => import("./ErrorReportJson"));

function ErrorReportDetail(props) {
  const [activeTab, setActiveTab] = useState({
    exception: "",
    sysmon: "Master",
    subtabs: "NUC",
    traceback: "Traceback",
  });
  const [sysmonObj, setSysmonObj] = useState({
    sysmonKeys: [],
    sysmonObj: {},
  });
  const [sysmonReport, setSysmonReport] = useState({});
  const [subTabObj, setSubTabObj] = useState(null);
  const [robocolor, setRoboColor] = useState({
    main: "",
    arm: "",
  });
  const {
    timezone,
    transformed: {
      sysmonreport,
      sysmonkeys,
      reportobj,
      erroredservices,
      exceptions,
    },
  } = useSelector((state) => state.errorreport);
  const { token } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.home);
  const { harvesters } = useSelector((state) => state.harvester);
  const { locations } = useSelector((state) => state.location);
  const { fruits } = useSelector((state) => state.fruit);
  const { exceptioncodes } = useSelector((state) => state.exceptioncode);
  const { users } = useSelector((state) => state.user);

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
    primary: true,
  });

  const exceptObj = exceptions.find(
    (x, i) => x.exec_label === activeTab.exception
  );
  const dispatch = useDispatch();
  const { search } = useLocation();
  const downloadRef = useRef();
  const createNotifRef = useRef();

  const harvesterOptions = transformHarvOptions(harvesters);
  const locationOptions = transformLocOptions(locations);
  const timezoneOptions = transformTzOptions(timezones);
  const fruitOptions = transformFruitOptions(fruits);
  const codeOptions = transformCodeOptions(exceptioncodes);
  const usersOptions = transformUserOptions(users);

  useEffect(() => {
    setSysmonReport((current) => sysmonreport);
    setSysmonObj((current) => {
      return {
        ...current,
        sysmonKeys: sysmonkeys,
        sysmonObj: sysmonreport[activeTab.sysmon],
      };
    });
  }, [activeTab.sysmon, sysmonkeys, sysmonreport]);

  const handleTabChange = (tab, category, obj) => {
    if (category === "exception") {
      setActiveTab((current) => {
        return { ...current, exception: tab };
      });
      let robot = robotInError(tab, sysmonReport);
      setTimeout(() => {
        setActiveTab((current) => {
          return { ...current, sysmon: robot.robot, subtabs: robot.arm };
        });
        setRoboColor((current) => {
          return { ...current, main: robot.robot };
        });
        if (robot.arm) {
          setRoboColor((current) => {
            return { ...current, main: robot.robot, arm: robot.arm };
          });
          setSubTabObj((current) => sysmonReport[robot.robot][robot.arm]);
        }
      }, 500);
    } else if (category === "sysmon") {
      setActiveTab((current) => {
        return { ...current, sysmon: tab };
      });
      setSysmonObj((current) => {
        return { ...current, sysmonObj: sysmonReport[tab] };
      });
      if (tab !== "Master") {
        setActiveTab((current) => {
          return { ...current, subtabs: "NUC" };
        });
        setSubTabObj((current) => sysmonReport[tab]["NUC"]);
        setRoboColor((current) => {
          return { ...current, arm: "" };
        });
      }
    } else if (category === "subtabs") {
      setActiveTab((current) => {
        return { ...current, subtabs: tab };
      });
      if (tab === "NUC") {
        setSubTabObj((current) => obj.NUC);
      } else {
        setSubTabObj((current) => obj.JETSON);
      }
    } else if (category === "traceback") {
      setActiveTab((current) => {
        return { ...current, traceback: tab };
      });
    }
  };

  const downloadPopUp = () => {
    downloadRef.current.click();
  };

  const handleDownloadFiles = async (fileObj) => {
    await handleDownload(fileObj, token);
  };

  const createNotifPopUp = async () => {
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
    createNotifRef.current.click();
    await Promise.all([
      dispatch(listHarvesters(MAX_LIMIT)),
      dispatch(listLocations(MAX_LIMIT)),
      dispatch(listFruits(MAX_LIMIT)),
      dispatch(listCodes(MAX_LIMIT)),
      dispatch(listUsers(MAX_LIMIT)),
    ]);
  };

  const handleFieldChange = (e) => {
    setFieldData((current) => {
      return { ...current, [e.target.name]: e.target.value };
    });
  };
  const handleCreateNotification = async () => {
    let queryObj = buildQueryObj(
      fieldData,
      selectedHarvId,
      selectedLocation,
      selectedTimezone,
      selectedFruit,
      selectedCode
    );
    delete queryObj["start_time"];
    delete queryObj["end_time"];
    if (selectedRecipient && selectedRecipient.length > 0) {
      queryObj["recipients"] = translateUserOptions(selectedRecipient);
    }
    let isValid = validateQueryObj(queryObj);
    if (!isValid) {
      toast.error(
        "You must include at least one query to create a notification",
        { theme: theme === THEME_MODES.AUTO_THEME ? "colored" : theme }
      );
      return;
    }
    const res = await dispatch(createNotification(queryObj));
    if (res?.payload?.status === SUCCESS) {
      toast.success(res?.payload?.message, {
        theme: theme === THEME_MODES.AUTO_THEME ? "colored" : theme,
      });
      createNotifRef.current.click();
    } else {
      toast.error(res?.payload, {
        theme: theme === THEME_MODES.AUTO_THEME ? "colored" : theme,
      });
    }
  };
  const handleHarvestSelect = handleSelectFactory(setSelectedHarvId);
  const handleLocationSelect = handleSelectFactory(setSelectedLocation);
  const handleTimezoneSelect = handleSelectFactory(setSelectedTimezone);
  const handleFruitSelect = handleSelectFactory(setSelectedFruit);
  const handleCodeSelect = handleSelectFactory(setSelectedCode);
  const handleRecipientSelect = handleSelectFactory(setSelectedRecipient);

  return (
    <>
      <RightButtonGroup
        createNotifPopUp={createNotifPopUp}
        createNotifRef={createNotifRef}
        downloadRef={downloadRef}
        popUp={downloadPopUp}
        theme={theme}
      />
      <ErrorReportDetailTable
        reportObj={reportobj}
        timezone={timezone}
        theme={theme}
      />
      <div className="row">
        <div className="col-md-7">
          <Container>
            <NavTabs>
              {exceptions.map((exec, _) => (
                <NavTabItem key={exec.id}>
                  <NavTabSpan
                    onClick={() =>
                      handleTabChange(exec.exec_label, "exception", undefined)
                    }
                    activetab={activeTab.exception}
                    navto={exec.exec_label}
                    theme={theme}
                  >
                    {exec.exec_label}
                    {exec.primary && <sup className="text-danger">*</sup>}
                  </NavTabSpan>
                </NavTabItem>
              ))}
            </NavTabs>

            {exceptObj && (
              <TabContent>
                <NavTabs>
                  <NavTabItem>
                    <NavTabSpan
                      onClick={() =>
                        handleTabChange("Traceback", "traceback", undefined)
                      }
                      activetab={activeTab.traceback}
                      navto={"Traceback"}
                      theme={theme}
                    >
                      Traceback
                    </NavTabSpan>
                  </NavTabItem>
                  <NavTabItem>
                    <NavTabSpan
                      onClick={() =>
                        handleTabChange("Info", "traceback", undefined)
                      }
                      activetab={activeTab.traceback}
                      navto={"Info"}
                      theme={theme}
                    >
                      Info
                    </NavTabSpan>
                  </NavTabItem>
                </NavTabs>
                <ExceptTabular
                  exceptName={exceptObj.code.name}
                  timestamp={timeStampFormat(exceptObj.timestamp, timezone)}
                  theme={theme}
                />
                <Editor
                  height="90vh"
                  language="python"
                  value={
                    activeTab.traceback === "Traceback"
                      ? exceptObj.traceback
                      : exceptObj.info
                  }
                  theme={theme === THEME_MODES.DARK_THEME ? "vs-dark" : "light"}
                  options={{ ...monacoOptions, readOnly: true }}
                />
              </TabContent>
            )}
          </Container>
        </div>
        <div className="col-md-5">
          <Container>
            <NavTabs>
              {sysmonObj.sysmonKeys.map((key, index) => (
                <NavTabItem key={index}>
                  <NavMainTabSpan
                    onClick={() =>
                      handleTabChange(key.robot, "sysmon", sysmonObj.sysmonObj)
                    }
                    activetab={activeTab.sysmon}
                    robocolor={robocolor.main}
                    navto={key.robot}
                    errored={key.error}
                    theme={theme}
                  >
                    {key.robot}
                  </NavMainTabSpan>
                </NavTabItem>
              ))}
            </NavTabs>

            {activeTab.sysmon !== "Master" && (
              <NavTabs>
                <NavTabItem>
                  <NavTabSpan
                    onClick={() =>
                      handleTabChange("NUC", "subtabs", sysmonObj.sysmonObj)
                    }
                    activetab={activeTab.subtabs}
                    robocolor={robocolor.arm}
                    navto={`NUC`}
                    theme={theme}
                  >
                    NUC
                  </NavTabSpan>
                </NavTabItem>
                <NavTabItem>
                  <NavTabSpan
                    onClick={() =>
                      handleTabChange("JETSON", "subtabs", sysmonObj.sysmonObj)
                    }
                    activetab={activeTab.subtabs}
                    robocolor={robocolor.arm}
                    navto={`JETSON`}
                    theme={theme}
                  >
                    JETSON
                  </NavTabSpan>
                </NavTabItem>
              </NavTabs>
            )}

            {activeTab.sysmon === "Master"
              ? sysmonObj.sysmonObj && (
                  <Container>
                    <div className="row">
                      <div className="col-xl-12 col-md-12 col-sm-12">
                        <Suspense
                          fallback={
                            <LoaderDiv>
                              <Loader size={25} />
                            </LoaderDiv>
                          }
                        >
                          <ChronyInfoPlot
                            robot="Master"
                            chronyInfo={sysmonObj.sysmonObj?.chrony_info}
                            theme={theme}
                          />
                        </Suspense>
                      </div>
                      <div className="col-xl-12 col-md-12 col-sm-12">
                        <TimeTable
                          sysmonObj={sysmonObj.sysmonObj}
                          theme={theme}
                        />
                      </div>
                    </div>
                    <ServiceTable
                      services={sysmonObj.sysmonObj?.services}
                      errors={erroredservices}
                      theme={theme}
                    />
                  </Container>
                )
              : subTabObj && (
                  <Container>
                    <div className="row">
                      <div className="col-xl-12 col-md-12 col-sm-12">
                        <Suspense
                          fallback={
                            <LoaderDiv>
                              <Loader size={25} />
                            </LoaderDiv>
                          }
                        >
                          <ChronyInfoPlot
                            robot="Robot"
                            chronyInfo={subTabObj?.chrony_info}
                            theme={theme}
                          />
                        </Suspense>
                      </div>
                      <div className="col-xl-12 col-md-12 col-sm-12">
                        <TimeTable sysmonObj={subTabObj} theme={theme} />
                      </div>
                    </div>
                    <ServiceTable
                      services={subTabObj?.services}
                      errors={erroredservices}
                      theme={theme}
                    />
                  </Container>
                )}
          </Container>
        </div>
      </div>
      <Container>
        <Suspense
          fallback={
            <LoaderDiv>
              <Loader size={25} />
            </LoaderDiv>
          }
        >
          <ErrorReportJson reportObj={reportobj} theme={theme} />
        </Suspense>
      </Container>
      <DownloadModal
        eventObj={reportobj?.event}
        handleDownload={handleDownloadFiles}
        theme={theme}
      />
      <CreateNotifModal
        codeOptions={codeOptions}
        fieldData={fieldData}
        fruitOptions={fruitOptions}
        handleCodeSelect={handleCodeSelect}
        handleFieldChange={handleFieldChange}
        handleFruitSelect={handleFruitSelect}
        handleHarvestSelect={handleHarvestSelect}
        handleLocationSelect={handleLocationSelect}
        handleRecipientSelect={handleRecipientSelect}
        handleSubmit={handleCreateNotification}
        handleTimezoneSelect={handleTimezoneSelect}
        harvesterOptions={harvesterOptions}
        locationOptions={locationOptions}
        selectedCode={selectedCode}
        selectedFruit={selectedFruit}
        selectedHarvId={selectedHarvId}
        selectedLocation={selectedLocation}
        selectedRecipient={selectedRecipient}
        selectedTimezone={selectedTimezone}
        theme={theme}
        timezoneOptions={timezoneOptions}
        usersOptions={usersOptions}
      />
    </>
  );
}

ErrorReportDetail.propTypes = {};

export default ErrorReportDetail;
