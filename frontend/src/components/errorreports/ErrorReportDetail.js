import { useSelector } from 'react-redux';
import { timeStampFormat, transformReportDetail } from '../../utils/utils';
import { Container } from "../styled";


function ErrorReportDetail(props) {
  const { report, timezone } = useSelector(state => state.errorreport);
  const { harvesters } = useSelector(state => state.harvester);
  const { locations } = useSelector(state => state.location);
  const reportObj = transformReportDetail(report, harvesters, locations);
  let reportData;
  if (report.report) {
    reportData = JSON.stringify(report.report, undefined, 2)
  }

  return (
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

      <Container>
      <div className="d-flex justify-content-center align-items-center">
        <textarea style={{width: '100%', height: '400px'}} defaultValue={reportData}></textarea>
      </div>
    </Container>
    </div>
  )
}

ErrorReportDetail.propTypes = {};

export default ErrorReportDetail;
