import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import MainLayout from '../../../components/layout/main';
import ErrorReportQuery from '../../../components/errorreports/ErrorReportQuery';
import ErrorReportTable from '../../../components/errorreports/ErrorReportTable';
import { listHarvesters } from '../../../features/harvester/harvesterSlice';
import { listLocations } from '../../../features/location/locationSlice';
import { errorreportListView } from '../../../features/errorreport/errorreportSlice';
import Pagination from '../../../components/pagination/Pagination';
import './styles.css';


function ErrorsReportList(props) {
  const dispatch = useDispatch();

  useEffect(() => {
    (async() => {
      await Promise.all([
        dispatch(listHarvesters()),
        dispatch(listLocations()),
        dispatch(errorreportListView())
      ]);
    })();
    return () => {}
  }, [dispatch]);
  
  return (
    <MainLayout>
      <div className='container'>
        <div>
          <div className='display-6 mt-4 mb-4'>
            HDS Prototype: Error Reports
          </div>
        </div>
        <ErrorReportQuery />
        <ErrorReportTable />
        <Pagination />
      </div>
    </MainLayout>
  )
}

ErrorsReportList.propTypes = {};

export default ErrorsReportList;
