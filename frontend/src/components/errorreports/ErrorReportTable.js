import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Loader, timeStampFormat } from "../../utils/utils";
import { Container, LoaderDiv, SpanTarget, Table, Td } from "../styled";
import { CodeHover, HarvesterHover, LocationHover } from "./ErrorHelpers";

function ErrorReportTable(props) {
  const { reports, loading, timezone } = useSelector(
    (state) => state.errorreport
  );
  const [hovering, setHovering] = useState({
    harvester: -1,
    location: -1,
    code: -1,
  });
  const [position, setPosition] = useState("top");
  const navigate = useNavigate();

  const navigateToDetail = (reportId) => navigate(`/errorreports/${reportId}`);

  const handleOnMouseEnter = (e, index, target, obj) => {
    if (index === 0) {
      setPosition("bottom");
    } else if (index === 1 && target === "code") {
      setPosition("bottom");
    } else {
      setPosition("top");
    }

    if (target === "harvester") {
      setHovering((current) => {
        return { ...current, harvester: index };
      });
    } else if (target === "location") {
      setHovering((current) => {
        return { ...current, location: index };
      });
    } else {
      setHovering((current) => {
        return { ...current, code: index };
      });
    }
  };

  const handleOnMouseLeave = (e) => {
    setHovering({ harvester: -1, location: -1 });
  };

  return (
    <Container className="table-responsive">
      {loading ? (
        <LoaderDiv>
          <Loader size={50} />
        </LoaderDiv>
      ) : (
        <Table className="table">
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
          <tbody className="report-tbody">
            {reports.map((report, index) => (
              <tr key={index} onClick={() => navigateToDetail(report.reportId)}>
                <td>{timeStampFormat(report.reportTime, timezone)}</td>
                <Td>
                  <SpanTarget
                    onMouseEnter={(e) =>
                      handleOnMouseEnter(
                        e,
                        index,
                        "harvester",
                        report.harvester
                      )
                    }
                    onMouseLeave={handleOnMouseLeave}
                  >
                    {report.harvester.harv_id}
                  </SpanTarget>{" "}
                  {hovering.harvester === index && (
                    <HarvesterHover
                      harvester={report.harvester}
                      position={position}
                    />
                  )}
                </Td>
                <Td>
                  <SpanTarget
                    onMouseEnter={(e) =>
                      handleOnMouseEnter(e, index, "location", report.location)
                    }
                    onMouseLeave={handleOnMouseLeave}
                  >
                    {report.location.ranch}
                  </SpanTarget>{" "}
                  {hovering.location === index && (
                    <LocationHover
                      location={report.location}
                      position={position}
                    />
                  )}
                </Td>
                <Td>
                  <SpanTarget
                    onMouseEnter={(e) =>
                      handleOnMouseEnter(e, index, "code", report.exceptions)
                    }
                    onMouseLeave={handleOnMouseLeave}
                  >
                    {report.code}
                  </SpanTarget>{" "}
                  {hovering.code === index && (
                    <CodeHover
                      exceptions={report.exceptions}
                      position={position}
                    />
                  )}
                </Td>
                <td>{report.service}</td>
                <td>{report.branch_name}</td>
                <td>{report.githash}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

ErrorReportTable.propTypes = {};

export default ErrorReportTable;
