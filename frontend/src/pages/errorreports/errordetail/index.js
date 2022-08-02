import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import ErrorReportDetail from '../../../components/errorreports/ErrorReportDetail';
import MainLayout from '../../../components/layout/main';
import { detailErrorReport } from '../../../features/errorreport/errorreportSlice';
import './styles.css';


function ErrorsReportDetail(props) {
  const params = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    (async() => {
      await dispatch(detailErrorReport(params.reportId))
    })();
  },[dispatch, params]);

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
