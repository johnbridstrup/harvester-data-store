import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Loader, timeStampFormat, transformTableErrorReport } from '../../utils/utils';
import { Container, LoaderDiv, Table } from '../styled';


function ErrorReportTable(props) {
  const { reports, loading, timezone } = useSelector(state => state.errorreport);
  const harvesters = useSelector(state => state.harvester.harvesters);
  const locations = useSelector(state => state.location.locations);
  const navigate = useNavigate();
  const errorreports = transformTableErrorReport(reports, harvesters, locations);

  const navigateToDetail = (reportId) => navigate(`/errorreports/${reportId}`);

  return (
    <Container className="table-responsive">
      {loading ? <LoaderDiv><Loader size={50} /></LoaderDiv> : (
      <Table className="table">
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
        <tbody className='report-tbody'>
          {errorreports.map((report, index) => (
            <tr key={index} onClick={() => navigateToDetail(report.reportId)}>
              <td>{timeStampFormat(report.reportTime, timezone)}</td>
              <td>{report.harvester.harv_id}</td>
              <td>{report.location.ranch}</td>
              <td>{report.code}</td>
              <td>{report.service}</td>
              <td>{report.branch_name}</td>
              <td>{report.githash}</td>
            </tr>
          ))}
        </tbody>
      </Table>)}
    </Container>
  )
}

ErrorReportTable.propTypes = {}

export default ErrorReportTable;
