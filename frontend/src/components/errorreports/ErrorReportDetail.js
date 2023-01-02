import { useState, useEffect, lazy, Suspense, useRef } from "react";
import { useSelector } from "react-redux";
import { handleDownload } from "utils/services";
import { Loader, robotInError, timeStampFormat } from "utils/utils";
import { DownloadButton } from "../common";
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
import { ExceptTabular } from "./ErrorHelpers";
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
      exceptionkeys,
      reportobj,
      erroredservices,
      exceptions,
    },
  } = useSelector((state) => state.errorreport);
  const { token } = useSelector((state) => state.auth);
  const exceptObj = exceptions[activeTab.exception];
  const downloadRef = useRef();

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

  return (
    <>
      <DownloadButton popUp={downloadPopUp} downloadRef={downloadRef} />
      <ErrorReportDetailTable reportObj={reportobj} timezone={timezone} />
      <div className="row">
        <div className="col-md-7">
          <Container>
            <NavTabs>
              {exceptionkeys.map((key, index) => (
                <NavTabItem key={index}>
                  <NavTabSpan
                    onClick={() => handleTabChange(key, "exception", undefined)}
                    activetab={activeTab.exception}
                    navto={key}
                  >
                    {key}
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
                    >
                      Info
                    </NavTabSpan>
                  </NavTabItem>
                </NavTabs>
                <ExceptTabular
                  exceptName={exceptObj.code.name}
                  timestamp={timeStampFormat(exceptObj.timestamp, timezone)}
                />
                <pre
                  style={{
                    height: "400px",
                    whiteSpace: "break-spaces",
                    marginTop: "2rem",
                  }}
                >
                  <code className="language-python">
                    {activeTab.traceback === "Traceback"
                      ? exceptObj.traceback
                      : exceptObj.info}
                  </code>
                </pre>
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
                          />
                        </Suspense>
                      </div>
                      <div className="col-xl-12 col-md-12 col-sm-12">
                        <TimeTable sysmonObj={sysmonObj.sysmonObj} />
                      </div>
                    </div>
                    <ServiceTable
                      services={sysmonObj.sysmonObj?.services}
                      errors={erroredservices}
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
                          />
                        </Suspense>
                      </div>
                      <div className="col-xl-12 col-md-12 col-sm-12">
                        <TimeTable sysmonObj={subTabObj} />
                      </div>
                    </div>
                    <ServiceTable
                      services={subTabObj?.services}
                      errors={erroredservices}
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
          <ErrorReportJson reportObj={reportobj} />
        </Suspense>
      </Container>
      <DownloadModal
        eventObj={reportobj?.event}
        handleDownload={handleDownloadFiles}
      />
    </>
  );
}

ErrorReportDetail.propTypes = {};

export default ErrorReportDetail;
