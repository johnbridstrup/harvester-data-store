import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { hoverEffect } from "features/errorreport/errorreportSlice";
import { darkThemeClass, Loader, timeStampFormat } from "utils/utils";
import { Container, LoaderDiv, SpanTarget, Table, Td } from "../styled";

function ErrorReportTable(props) {
  const {
    reports,
    loading,
    timezone,
    internal: { searchObj },
  } = useSelector((state) => state.errorreport);
  const { theme } = useSelector((state) => state.home);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { search } = useLocation();

  const navigateToDetail = (e, reportId) => {
    e.preventDefault();
    const params = new URLSearchParams(searchObj || {});
    if (searchObj) {
      navigate(`/errorreports/${reportId}?${params.toString()}`);
    } else {
      navigate(`/errorreports/${reportId}${search.toString()}`);
    }
  };

  const handleOnMouseEnter = (e, index, target, obj) => {
    dispatch(hoverEffect({ obj, type: target.toUpperCase() }));
  };

  const tabledt = darkThemeClass("dt-table", theme);
  const rowdt = darkThemeClass("dt-row", theme);

  return (
    <Container className="table-responsive">
      {loading ? (
        <LoaderDiv>
          <Loader size={50} />
        </LoaderDiv>
      ) : (
        <Table className={`table ${tabledt}`}>
          <thead>
            <tr>
              <th>ID</th>
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
              <tr key={report.reportId} className={`tr-hover cursor ${rowdt}`}>
                <td>
                  <Link
                    to={`/errorreports/${report.reportId}`}
                    onClick={(e) => navigateToDetail(e, report.reportId)}
                  >
                    {report.reportId}
                  </Link>
                </td>
                <td>
                  <Link
                    to={`/errorreports/${report.reportId}`}
                    onClick={(e) => navigateToDetail(e, report.reportId)}
                    className="table-link"
                  >
                    {timeStampFormat(report.reportTime, timezone)}
                  </Link>
                </td>
                <Td>
                  <Link
                    to={`/errorreports/${report.reportId}`}
                    onClick={(e) => navigateToDetail(e, report.reportId)}
                    className="table-link"
                  >
                    <SpanTarget
                      onMouseEnter={(e) =>
                        handleOnMouseEnter(
                          e,
                          index,
                          "harvester",
                          report.harvester
                        )
                      }
                    >
                      {report.harvester.harv_id}
                    </SpanTarget>
                  </Link>
                </Td>
                <Td>
                  <Link
                    to={`/errorreports/${report.reportId}`}
                    onClick={(e) => navigateToDetail(e, report.reportId)}
                    className="table-link"
                  >
                    <SpanTarget
                      onMouseEnter={(e) =>
                        handleOnMouseEnter(
                          e,
                          index,
                          "location",
                          report.location
                        )
                      }
                    >
                      {report.location.ranch}
                    </SpanTarget>
                  </Link>
                </Td>
                <Td>
                  <Link
                    to={`/errorreports/${report.reportId}`}
                    onClick={(e) => navigateToDetail(e, report.reportId)}
                    className="table-link"
                  >
                    <SpanTarget
                      onMouseEnter={(e) =>
                        handleOnMouseEnter(e, index, "code", report.exceptions)
                      }
                    >
                      {report.code}
                    </SpanTarget>
                  </Link>
                </Td>
                <td>
                  <Link
                    to={`/errorreports/${report.reportId}`}
                    onClick={(e) => navigateToDetail(e, report.reportId)}
                    className="table-link"
                  >
                    {report.service}
                  </Link>
                </td>
                <td>
                  <Link
                    to={`/errorreports/${report.reportId}`}
                    onClick={(e) => navigateToDetail(e, report.reportId)}
                    className="table-link"
                  >
                    {report.branch_name}
                  </Link>
                </td>
                <td>
                  <Link
                    to={`/errorreports/${report.reportId}`}
                    onClick={(e) => navigateToDetail(e, report.reportId)}
                    className="table-link"
                  >
                    {report.githash}
                  </Link>
                </td>
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
