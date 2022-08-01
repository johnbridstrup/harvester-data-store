import { useSelector } from 'react-redux';
import { Loader, timeStampFormat, transformTableErrorReport } from '../../utils/utils';
import { Container, LoaderDiv, Table } from '../styled';


function ErrorReportTable(props) {
  const { reports, loading, timezone } = useSelector(state => state.errorreport);
  const harvesters = useSelector(state => state.harvester.harvesters);
  const locations = useSelector(state => state.location.locations);
  const errorreports = transformTableErrorReport(reports, harvesters, locations);

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
        <tbody>
          {errorreports.map((report, index) => (
            <tr key={index}>
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
