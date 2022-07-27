import { useSelector } from 'react-redux';
import styled from "styled-components";
import { Loader, timeStampFormat, transformTableErrorReport } from '../../utils/utils';


function ErrorReportTable(props) {
  const { reports, loading } = useSelector(state => state.errorreport);
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
              <td>{timeStampFormat(report.reportTime)}</td>
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

const Container = styled.div`
  margin-top: 3rem;
  margin-bottom: 1rem
`;

const LoaderDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 25vh
`;

const Table = styled.table``;

ErrorReportTable.propTypes = {}

export default ErrorReportTable;
