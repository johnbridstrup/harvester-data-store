import PropTypes from 'prop-types'

function TimeTable(props) {
  return (
    <div className='table-responsive'>
      <table className='table table-bordered'>
        <tbody>
          <tr>
            <th scope='col'>System Time</th>
            <th scope='col'>{props.sysmonObj.chrony_info?.sys_time}</th>
          </tr>
          <tr>
            <th scope='col'>Reference Time</th>
            <th scope='col'>{props.sysmonObj.chrony_info?.ref_time}</th>
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
