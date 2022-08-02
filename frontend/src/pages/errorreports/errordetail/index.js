import { useParams } from 'react-router-dom';
import ErrorReportDetail from '../../../components/errorreports/ErrorReportDetail';
import MainLayout from '../../../components/layout/main';
import './styles.css';


function ErrorsReportDetail(props) {
  const params = useParams();
  return (
    <MainLayout>
      <div className='container'>
        <div>
          <div className='display-6 mt-4 mb-4'>
            HDS Prototype: Error Reports {params.reportId}
          </div>
        </div>
        <ErrorReportDetail />
      </div>
    </MainLayout>
  )
}

ErrorsReportDetail.propTypes = {};

export default ErrorsReportDetail;
