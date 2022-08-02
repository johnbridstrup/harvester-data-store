import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { timeStampFormat, transformReportDetail } from '../../utils/utils';
import { Container, NavTabItem, NavTabLink, NavTabs } from "../styled";


function ErrorReportDetail(props) {
  const [activeTab, setActiveTab] = useState(null)
  const { report, timezone } = useSelector(state => state.errorreport);
  const { harvesters } = useSelector(state => state.harvester);
  const { locations } = useSelector(state => state.location);
  const reportObj = transformReportDetail(report, harvesters, locations);
  let reportData;
  if (report.report) {
    reportData = JSON.stringify(report.report, undefined, 2)
  }

  const { hash } = useLocation();
  const handleTabChange = (keyHref) => {
    setActiveTab(keyHref)
  }

  useEffect(() => {
    if (hash) {
      handleTabChange(hash);
    }
  }, [hash])

  console.log(activeTab)

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
      <div className='col-md-5'>
        <Container>	
          <NavTabs>
            <NavTabItem><NavTabLink to={"#1"} activeTab={activeTab} navTo={"#1"}>traychg.0: 1</NavTabLink>
            </NavTabItem>
            <NavTabItem><NavTabLink to={"#2"} activeTab={activeTab} navTo={"#2"}>harvester.0: 1</NavTabLink>
            </NavTabItem>
            <NavTabItem><NavTabLink to={"#3"} activeTab={activeTab} navTo={"#3"}>drivesys.0: 1</NavTabLink>
            </NavTabItem>
          </NavTabs>

          <div className="tab-content ">
            <div className="tab-pane active" id="1">
              <p>Timestamp 20221208230439</p>
              <pre><code>traceback</code></pre>
            </div>
            <div className="tab-pane" id="2">
            <p>Timestamp 20221208230439</p>
              <pre><code>traceback</code></pre>
            </div>
            <div className="tab-pane" id="3">
              <p>Timestamp 20221208230439</p>
              <pre><code>traceback</code></pre>
            </div>
          </div>
        </Container>
      </div>
      <div className='col-md-7'>
        <Container>
          <div className="d-flex justify-content-center align-items-center">
            <textarea style={{width: '100%', height: '400px'}} defaultValue={reportData}></textarea>
          </div>
        </Container>
      </div>
    </div>
    </>
  )
}


ErrorReportDetail.propTypes = {};

export default ErrorReportDetail;
