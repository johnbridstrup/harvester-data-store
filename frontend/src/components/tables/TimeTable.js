import PropTypes from 'prop-types'

function TimeTable(props) {
  return (
    <div className='table-responsive'>
      <table className='table table-bordered'>
        <tbody>
          <tr>
            <td>System Time</td>
            <td>{props.sysmonObj.chrony_info && props.sysmonObj.chrony_info.sys_time}</td>
          </tr>
          <tr>
            <td>Reference Time</td>
            <td>{props.sysmonObj.chrony_info && props.sysmonObj.chrony_info.ref_time}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

TimeTable.propTypes = {
  sysmonObj: PropTypes.object
}

export default TimeTable;
