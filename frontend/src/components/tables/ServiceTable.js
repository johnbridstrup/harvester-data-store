import PropTypes from "prop-types";
import { useMemo } from "react";
import {
  darkThemeClass,
  transformErroredServices,
  transformSysmonServices,
} from "utils/utils";

function ServiceTable(props) {
  const services = useMemo(
    () => transformSysmonServices(props.services),
    [props.services]
  );
  const erroredservices = useMemo(
    () => transformErroredServices(props.errors),
    [props.errors]
  );
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
            <tr key={index} className={evaluateColor(service, erroredservices)}>
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
