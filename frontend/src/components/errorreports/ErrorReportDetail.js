import { useSelector } from 'react-redux';
import { Container } from "../styled";


function ErrorReportDetail(props) {
  const { report } = useSelector(state => state.errorreport);
  let reportData;
  if (report.report) {
    reportData = JSON.stringify(report.report, undefined, 2)
  }
  return (
    <Container>
      <div className="d-flex justify-content-center align-items-center">
        <textarea style={{width: '100%', height: '400px'}} defaultValue={reportData}></textarea>
      </div>
    </Container>
  )
}

ErrorReportDetail.propTypes = {};

export default ErrorReportDetail;
