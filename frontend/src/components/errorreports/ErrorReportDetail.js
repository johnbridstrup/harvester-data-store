import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { timeStampFormat, transformExceptionObj, transformReportDetail, transformSysmonReport } from '../../utils/utils';
import { Container, NavTabItem, NavTabLink, NavTabs, NavTabSpan, TabContent } from "../styled";


function ErrorReportDetail(props) {
  const [activeTab, setActiveTab] = useState(null)
  const [activeSubTab, setActiveSubTab] = useState(null);
  const [subTabObj, setSubTabObj] = useState(null);
  const { report, timezone } = useSelector(state => state.errorreport);
  const { harvesters } = useSelector(state => state.harvester);
  const { locations } = useSelector(state => state.location);
  const reportObj = transformReportDetail(report, harvesters, locations);
  const exceptions = transformExceptionObj(report.exceptions);
  const exceptionsKeys = Object.keys(exceptions);
  
  
  let sysmonKeys;
  let sysmonReport;
  if (report.report && report.report.data && report.report.data.sysmon_report) {
    sysmonReport = transformSysmonReport(report.report.data.sysmon_report)
    sysmonKeys = Object.keys(sysmonReport);
  }

  const { hash } = useLocation();
  const handleTabChange = (keyHref) => {
    setActiveTab(keyHref)
  }

  useEffect(() => {
    if (hash) {
      handleTabChange(hash.replace("%20", " "));
    }
  }, [hash]);

  let exceptObj;
  let sysmonObj;
  if (typeof activeTab === "string") {
    exceptObj = exceptions[activeTab.replace("#", "")]
    sysmonObj = sysmonReport[activeTab.replace("#", "")]
  }

  const handleSubNavTabClick = (tab, obj) => {
    setActiveSubTab(tab);
    if (tab === "NUC") {
      setSubTabObj(current => obj.NUC)
    } else {
      setSubTabObj(current => obj.JETSON)
    }
  }

  console.log(subTabObj)

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
              <NavTabItem key={index}><NavTabLink to={`#${key}`} activetab={activeTab} navto={`#${key}`}>{key}</NavTabLink>
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
              {sysmonKeys && sysmonKeys.map((key, index) => (
                <NavTabItem key={index}><NavTabLink to={`#${key}`} activetab={activeTab} navto={`#${key}`}>{key}</NavTabLink>
                </NavTabItem>
              )) }
          </NavTabs>

          {activeTab && activeTab.replace("#", "") !== "Master" && (
            <NavTabs>
              <NavTabItem><NavTabSpan onClick={() => handleSubNavTabClick("NUC", sysmonObj)}  activetab={activeSubTab} navto={`NUC`}>NUC</NavTabSpan>
              </NavTabItem>
              <NavTabItem><NavTabSpan onClick={() => handleSubNavTabClick("JETSON", sysmonObj)}  activetab={activeSubTab} navto={`JETSON`}>JETSON</NavTabSpan>
              </NavTabItem>
            </NavTabs>
          ) }

          {activeTab && activeTab.replace("#", "") === "Master" ? sysmonObj && (
            <Container>
              <div className="d-flex justify-content-center align-items-center">
                <textarea style={{width: '100%', height: '400px'}} value={JSON.stringify(sysmonObj, undefined, 2)}></textarea>
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
