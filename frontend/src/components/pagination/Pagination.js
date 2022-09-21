import { useState } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { PROD_ENV } from "../../features/base/constants";
import { ERROR_REPORT_URL } from "../../features/errorreport/errorreportService";
import { paginateErrorReport } from "../../features/errorreport/errorreportSlice";
import { paginateNotification } from "../../features/notification/notificationSlice";
import { paginateUser } from "../../features/user/userSlice";
import { InputLimit, PageItem, SpanLimit } from "../styled";
import { paginateHarvester } from "../../features/harvester/harvesterSlice";
import { paginateLocation } from "../../features/location/locationSlice";

function Pagination(props) {
  const [pageLimit, setPageLimit] = useState(10);
  const { queryUrl } = useSelector((state) => state.errorreport);
  const { next, previous } = useSelector((state) => state.errorreport);
  const dispatch = useDispatch();
  const { search } = useLocation();

  const handleOnLimitChange = (limit) => {
    setPageLimit(limit);
  };

  const handleOnLimitSubmit = async () => {
    let url;
    if (typeof queryUrl === "string" && queryUrl.length > 0) {
      url = new URL(queryUrl);
      url.searchParams.set("limit", pageLimit);
      await dispatch(
        paginateErrorReport(
          `${ERROR_REPORT_URL}?${url.searchParams.toString()}`
        )
      );
    } else {
      let urlStr = `${ERROR_REPORT_URL}?${search.toString()}`;
      url = new URL(urlStr);
      url.searchParams.set("limit", pageLimit);
      await dispatch(paginateErrorReport(url));
    }
  };

  const handlePagination = async (navigation) => {
    const urlMap = {
      next: next,
      previous: previous,
    };
    const url = new URL(urlMap[navigation]);
    if (process.env.REACT_APP_NODE_ENV === PROD_ENV) {
      url.protocol = "https:";
    }
    url.searchParams.set("limit", pageLimit);
    await dispatch(paginateErrorReport(url));
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
              <SpanLimit className="btn btn-sm" onClick={handleOnLimitSubmit}>
                Go
              </SpanLimit>
            </PageItem>
          </ul>
        </nav>
      </section>
    </div>
  );
}

const GenericRenderer = (props) => {
  return (
    <div>
      <section className="d-flex justify-content-center align-items-center mb-5">
        <nav aria-label="Page navigation example">
          <ul className="pagination mb-0">
            <li className="page-item cursor">
              <span
                onClick={() => props.handlePagination("previous")}
                className={`page-link ${!props.previous && "disabled"}`}
                aria-label="Previous"
              >
                <span aria-hidden="true">Previous</span>
              </span>
            </li>
            <li className="page-item cursor">
              <span
                onClick={() => props.handlePagination("next")}
                className={`page-link ${!props.next && "disabled"}`}
                aria-label="Next"
              >
                <span aria-hidden="true">Next</span>
              </span>
            </li>
          </ul>
        </nav>
      </section>
    </div>
  );
};

export const UserPagination = (props) => {
  const {
    pagination: { next, previous },
  } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handlePagination = async (navigation) => {
    const urlMap = {
      next: next,
      previous: previous,
    };
    const url = new URL(urlMap[navigation]);
    if (process.env.REACT_APP_NODE_ENV === PROD_ENV) {
      url.protocol = "https:";
    }
    await dispatch(paginateUser(url));
  };

  return (
    <GenericRenderer
      handlePagination={handlePagination}
      next={next}
      previous={previous}
    />
  );
};

export const NotificationPagination = (props) => {
  const {
    pagination: { next, previous },
  } = useSelector((state) => state.notification);
  const dispatch = useDispatch();

  const handlePagination = async (navigation) => {
    const urlMap = {
      next: next,
      previous: previous,
    };
    const url = new URL(urlMap[navigation]);
    if (process.env.REACT_APP_NODE_ENV === PROD_ENV) {
      url.protocol = "https:";
    }
    await dispatch(paginateNotification(url));
  };
  return (
    <GenericRenderer
      handlePagination={handlePagination}
      next={next}
      previous={previous}
    />
  );
};

export const HarvesterPagination = (props) => {
  const {
    pagination: { next, previous },
  } = useSelector((state) => state.harvester);
  const dispatch = useDispatch();

  const handlePagination = async (navigation) => {
    const urlMap = {
      next: next,
      previous: previous,
    };
    const url = new URL(urlMap[navigation]);
    if (process.env.REACT_APP_NODE_ENV === PROD_ENV) {
      url.protocol = "https:";
    }
    await dispatch(paginateHarvester(url));
  };
  return (
    <GenericRenderer
      handlePagination={handlePagination}
      next={next}
      previous={previous}
    />
  );
};

export const LocationPagination = (props) => {
  const {
    pagination: { next, previous },
  } = useSelector((state) => state.location);
  const dispatch = useDispatch();

  const handlePagination = async (navigation) => {
    const urlMap = {
      next: next,
      previous: previous,
    };
    const url = new URL(urlMap[navigation]);
    if (process.env.REACT_APP_NODE_ENV === PROD_ENV) {
      url.protocol = "https:";
    }
    await dispatch(paginateLocation(url));
  };
  return (
    <GenericRenderer
      handlePagination={handlePagination}
      next={next}
      previous={previous}
    />
  );
};

Pagination.propTypes = {};

GenericRenderer.propTypes = {
  handlePagination: PropTypes.func,
  previous: PropTypes.string,
  next: PropTypes.string,
};

export default Pagination;
