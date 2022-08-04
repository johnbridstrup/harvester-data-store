import PropTypes from 'prop-types'
import { transformSysmonServices } from '../../utils/utils';

function ServiceTable(props) {
  const services = transformSysmonServices(props.services)
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
          {services.map((service, index) => (
            <tr key={index}>
              {service.map((obj, index) => (
                <td key={index}>{obj}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

ServiceTable.propTypes = {
  services: PropTypes.object
};

export default ServiceTable;
