import PropTypes from "prop-types";
import { darkThemeClass, transformSysmonServices } from "utils/utils";

function ServiceTable(props) {
  const services = transformSysmonServices(props.services);
  const evaluateColor = (services = [], errors = []) => {
    const found = services.some((service) => errors.includes(service));
    if (found) {
      return "bg-danger";
    } else {
      return "";
    }
  };
  const tabledt = darkThemeClass("dt-table", props.theme);
  return (
    <div className="table-responsive">
      <table className={`table ${tabledt}`}>
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
            <tr key={index} className={evaluateColor(service, props.errors)}>
              {service.map((obj, index) => (
                <td key={index}>{obj}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

ServiceTable.propTypes = {
  services: PropTypes.object,
  errors: PropTypes.array,
  theme: PropTypes.string,
};

export default ServiceTable;
