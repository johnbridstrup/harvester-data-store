import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { ERROR_REPORT_URL } from "../../features/errorreport/errorreportService";
import { paginateErrorReport } from "../../features/errorreport/errorreportSlice";
import { InputLimit, PageItem, SpanLimit } from "../styled";

function Pagination(props) {
  const [pageLimit, setPageLimit] = useState(10);
  const { queryUrl } = useSelector((state) => state.errorreport);
  const { next, previous } = useSelector((state) => state.errorreport);
  const dispatch = useDispatch();
  const { search } = useLocation();

  const handleOnLimitChange = async (limit) => {
    setPageLimit(limit);
    let url;
    if (typeof queryUrl === "string" && queryUrl.length > 0) {
      url = new URL(queryUrl);
      url.searchParams.set("limit", limit);
      await dispatch(
        paginateErrorReport(
          `${ERROR_REPORT_URL}?${url.searchParams.toString()}`
        )
      );
    } else {
      let urlStr = `${ERROR_REPORT_URL}?${search.toString()}`;
      url = new URL(urlStr);
      url.searchParams.set("limit", limit);
      await dispatch(paginateErrorReport(url));
    }
  };

  const handlePagination = async (navigation) => {
    if (navigation === "next") {
      if (next) {
        const url = new URL(next);
        if (process.env.REACT_APP_NODE_ENV === "production")
          url.protocol = "https:";
        url.searchParams.set("limit", pageLimit);
        await dispatch(paginateErrorReport(url));
      }
    } else {
      if (previous) {
        const url = new URL(previous);
        if (process.env.REACT_APP_NODE_ENV === "production")
          url.protocol = "https:";
        url.searchParams.set("limit", pageLimit);
        await dispatch(paginateErrorReport(url));
      }
    }
  };

  return (
    <div>
      <section className="d-flex justify-content-center align-items-center mb-5">
        <nav aria-label="Page navigation example">
          <ul className="pagination mb-0">
            <li className="page-item cursor">
              <span
                onClick={() => handlePagination("previous")}
                className={`page-link ${!previous && "disabled"}`}
                aria-label="Previous"
              >
                <span aria-hidden="true">Previous</span>
              </span>
            </li>
            <li className="page-item cursor">
              <span
                onClick={() => handlePagination("next")}
                className={`page-link ${!next && "disabled"}`}
                aria-label="Next"
              >
                <span aria-hidden="true">Next</span>
              </span>
            </li>
            <PageItem>
              <SpanLimit>Limit</SpanLimit>
              <InputLimit
                type="number"
                value={pageLimit}
                onChange={(e) => handleOnLimitChange(e.target.value)}
              />
            </PageItem>
          </ul>
        </nav>
      </section>
    </div>
  );
}

Pagination.propTypes = {};

export default Pagination;
