import PropTypes from 'prop-types'

function ServiceTable(props) {
  return (
    <div className='table-responsive'>
      <table className='table'>
        <thead>
          <tr>
            <th>Service</th>
            <th>cpu</th>
            <th>mem</th>
            <th>fsm components</th>
          </tr>
        </thead>
        <tbody>
          <tr></tr>
        </tbody>
      </table>
    </div>
  )
}

ServiceTable.propTypes = {};

export default ServiceTable;
