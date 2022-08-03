import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { timeStampFormat, transformExceptionObj, transformReportDetail, transformSysmonReport } from '../../utils/utils';
import { Container, NavTabItem, NavTabs, NavTabSpan, TabContent } from "../styled";


function ErrorReportDetail(props) {
  const [activeTab, setActiveTab] = useState({
    exception: "",
    sysmon: "Master",
    subtabs: "NUC"
  });
  const [sysmonObj, setSysmonObj] = useState({
    sysmonKeys: [],
    sysmonReport: {},
    sysmonObj: {}
  });
  const [subTabObj, setSubTabObj] = useState(null);
  const { report, timezone } = useSelector(state => state.errorreport);
  const { harvesters } = useSelector(state => state.harvester);
  const { locations } = useSelector(state => state.location);
  const reportObj = transformReportDetail(report, harvesters, locations);
  const exceptions = transformExceptionObj(report.exceptions);
  const exceptionsKeys = Object.keys(exceptions);
  const exceptObj = exceptions[activeTab.exception];
  
  
  // let sysmonKeys;
  // let sysmonReport;
  // // let sysmonObj;
  // if (report.report && report.report.data && report.report.data.sysmon_report) {
  //   sysmonReport = transformSysmonReport(report.report.data.sysmon_report)
  //   sysmonKeys = Object.keys(sysmonReport);
  //   sysmonObj= sysmonReport[activeTab.sysmon]
  // }

  useEffect(() => {
    if (report.report && report.report.data && report.report.data.sysmon_report) {
      const sysmonReport = transformSysmonReport(report.report.data.sysmon_report)
      const sysmonKeys = Object.keys(sysmonReport);
      const sysmonObj= sysmonReport[activeTab.sysmon]
      setSysmonObj(current => {
        return {...current, sysmonKeys, sysmonObj, sysmonReport}
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
      if (tab !== "Master") {
        setSubTabObj(current => obj.NUC)
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
    <div className='row'>
      <div className='col'>
        <div className='table-responsive'>
          <table className='table'>
            <thead>
              <tr>
                <th>Time</th>
                <th>Harvester</th>
                <th>Location</th>
                <th>Code</th>
                <th>Services</th>
                <th>Branch</th>
                <th>Githash</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{timeStampFormat(reportObj.reportTime, timezone)}</td>
                <td>{reportObj.harvester && reportObj.harvester.harv_id}</td>
                <td>{reportObj.location && reportObj.location.ranch}</td>
                <td>{reportObj.code}</td>
                <td>{reportObj.service}</td>
                <td>{reportObj.report && reportObj.report.data && reportObj.report.data.branch_name }</td>
                <td>{reportObj.report && reportObj.report.data && reportObj.report.data.githash}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
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

          {activeTab.sysmon === "Master" ? sysmonObj && (
            <Container>
              <div className="d-flex justify-content-center align-items-center">
                <textarea style={{width: '100%', height: '400px'}} value={JSON.stringify(sysmonObj.sysmonObj, undefined, 2)}></textarea>
              </div>
            </Container>
          ): subTabObj && (
            <Container>
              <div className="d-flex justify-content-center align-items-center">
                <textarea style={{width: '100%', height: '400px'}} value={JSON.stringify(subTabObj, undefined, 2)}></textarea>
              </div>
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
