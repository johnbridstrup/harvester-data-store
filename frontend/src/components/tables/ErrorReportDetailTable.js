import PropTypes from 'prop-types';
import { timeStampFormat } from '../../utils/utils';

function ErrorReportDetailTable(props) {

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
                <td>{timeStampFormat(props.reportObj?.reportTime, props.timezone)}</td>
                <td>{props.reportObj?.harvester?.harv_id}</td>
                <td>{props.reportObj?.location?.ranch}</td>
                <td>{props.reportObj?.code}</td>
                <td>{props.reportObj?.service}</td>
                <td>{props.reportObj?.report?.data?.branch_name }</td>
                <td>{props.reportObj?.report?.data?.githash}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

ErrorReportDetailTable.propTypes = {
  reportObj: PropTypes.object,
  timezone: PropTypes.string
}

export default ErrorReportDetailTable;
