import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { timeStampFormat, transformExceptionObj, transformReportDetail, transformSysmonReport } from '../../utils/utils';
import ChronyInfoPlot from '../plotly/ChronyInfoPlot';
import { Container, NavTabItem, NavTabs, NavTabSpan, TabContent } from "../styled";
import ErrorReportDetailTable from '../tables/ErrorReportDetailTable';
import ServiceTable from '../tables/ServiceTable';
import TimeTable from '../tables/TimeTable';


function ErrorReportDetail(props) {
  const [activeTab, setActiveTab] = useState({
    exception: "",
    sysmon: "Master",
    subtabs: "NUC"
  });
  const [sysmonObj, setSysmonObj] = useState({
    sysmonKeys: [],
    sysmonObj: {}
  });
  const [sysmonReport, setSysmonReport] = useState({});
  const [subTabObj, setSubTabObj] = useState(null);
  const { report, timezone } = useSelector(state => state.errorreport);
  const reportObj = transformReportDetail(report)
  const exceptions = transformExceptionObj(report.exceptions);
  const exceptionsKeys = Object.keys(exceptions);
  const exceptObj = exceptions[activeTab.exception];
  

  useEffect(() => {
    if (report?.report?.data?.sysmon_report) {
      const sysmonReport = transformSysmonReport(report.report.data.sysmon_report)
      const sysmonKeys = Object.keys(sysmonReport);
      setSysmonReport(current => sysmonReport)
      const sysmonObj= sysmonReport[activeTab.sysmon]
      setSysmonObj(current => {
        return {...current, sysmonKeys, sysmonObj}
      })
    }
  },[report.report, activeTab.sysmon])

  const handleTabChange = (tab, category, obj) => {
    if (category === "exception") {
      setActiveTab(current => {
        return {...current, exception: tab}
      })
    } else if (category === "sysmon") {
      setActiveTab(current => {
        return {...current, sysmon: tab}
      })
      setSysmonObj(current => {
        return {...current, sysmonObj: sysmonReport[tab]}
      })
      if (tab !== "Master") {
        setActiveTab(current => {
          return {...current, subtabs: "NUC"}
        })
        setSubTabObj(current => sysmonReport[tab]['NUC'])
      }
    } else if (category === "subtabs") {
      setActiveTab(current => {
        return {...current, subtabs: tab}
      })
      if (tab === "NUC") {
        setSubTabObj(current => obj.NUC)
      } else {
        setSubTabObj(current => obj.JETSON)
      }
    }
  }

  return (
    <>
    <ErrorReportDetailTable reportObj={reportObj} timezone={timezone} />
    <div className='row'>
      <div className='col-md-7'>
        <Container>
          <NavTabs>
            { exceptionsKeys.map((key, index) => (
              <NavTabItem key={index}><NavTabSpan onClick={() => handleTabChange(key, "exception", undefined)} activetab={activeTab.exception} navto={key}>{key}</NavTabSpan>
              </NavTabItem>
            )) }
          </NavTabs>
          
          {exceptObj && (
            <TabContent>
              <span>timestamp {timeStampFormat(exceptObj.timestamp, timezone)}</span>
              <pre style={{height: "400px", whiteSpace: "break-spaces"}}><code className='language-python'>{exceptObj.traceback}</code></pre>
          </TabContent>
          )}
        </Container>
      </div>
      <div className='col-md-5'>
        <Container>
          <NavTabs>
              {sysmonObj.sysmonKeys.map((key, index) => (
                <NavTabItem key={index}><NavTabSpan onClick={() => handleTabChange(key, "sysmon", sysmonObj.sysmonObj)} activetab={activeTab.sysmon} navto={key}>{key}</NavTabSpan>
                </NavTabItem>
              )) }
          </NavTabs>

          {activeTab.sysmon !== "Master" && (
            <NavTabs>
              <NavTabItem><NavTabSpan onClick={() => handleTabChange("NUC", "subtabs", sysmonObj.sysmonObj)}  activetab={activeTab.subtabs} navto={`NUC`}>NUC</NavTabSpan>
              </NavTabItem>
              <NavTabItem><NavTabSpan onClick={() => handleTabChange("JETSON", "subtabs", sysmonObj.sysmonObj)}  activetab={activeTab.subtabs} navto={`JETSON`}>JETSON</NavTabSpan>
              </NavTabItem>
            </NavTabs>
          ) }

          {activeTab.sysmon === "Master" ? sysmonObj.sysmonObj && (
            <Container>
              <div className='row'>
                <div className='col-xl-12 col-md-12 col-sm-12'>
                  <ChronyInfoPlot robot="Master" chronyInfo={sysmonObj.sysmonObj?.chrony_info} />
                </div>
                <div className='col-xl-12 col-md-12 col-sm-12'>
                  <TimeTable sysmonObj={sysmonObj.sysmonObj} />
                </div>
              </div>
              <ServiceTable services={sysmonObj.sysmonObj?.services} />
            </Container>
          ): subTabObj && (
            <Container>
              <div className='row'>
                <div className='col-xl-12 col-md-12 col-sm-12'>
                  <ChronyInfoPlot robot="Robot" chronyInfo={subTabObj?.chrony_info} />
                </div>
                <div className='col-xl-12 col-md-12 col-sm-12'>
                  <TimeTable sysmonObj={subTabObj} />
                </div>
              </div>
              <ServiceTable services={subTabObj?.services} />
            </Container>
          )}
          
        </Container>
      </div>
    </div>
    </>
  )
}


ErrorReportDetail.propTypes = {};

export default ErrorReportDetail;
