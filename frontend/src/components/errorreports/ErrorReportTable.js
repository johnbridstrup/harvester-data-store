import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { hoverEffect } from "../../features/errorreport/errorreportSlice";
import { Loader, timeStampFormat } from "../../utils/utils";
import { Container, LoaderDiv, SpanTarget, Table, Td } from "../styled";

function ErrorReportTable(props) {
  const {
    reports,
    loading,
    timezone,
    internal: { searchObj },
  } = useSelector((state) => state.errorreport);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { search } = useLocation();

  const navigateToDetail = (reportId) => {
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
              <tr
                key={index}
                onClick={() => navigateToDetail(report.reportId)}
                className="tr-hover cursor"
              >
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
                  >
                    {report.harvester.harv_id}
                  </SpanTarget>
                </Td>
                <Td>
                  <SpanTarget
                    onMouseEnter={(e) =>
                      handleOnMouseEnter(e, index, "location", report.location)
                    }
                  >
                    {report.location.ranch}
                  </SpanTarget>
                </Td>
                <Td
                  onMouseEnter={(e) =>
                    handleOnMouseEnter(e, index, "code", report.exceptions)
                  }
                >
                  <SpanTarget>{report.code}</SpanTarget>
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
