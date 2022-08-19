import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import ErrorParetos from "../../../components/errorreports/ErrorParetos";
import MainLayout from "../../../components/layout/main";
import { generatePareto } from "../../../features/errorreport/errorreportSlice";
import { paramsToObject } from "../../../utils/utils";

function ErrorReportPareto(props) {
  const dispatch = useDispatch();
  const { search } = useLocation();

  useEffect(() => {
    const paramsObj = paramsToObject(search);
    (async () => {
      dispatch(generatePareto(paramsObj));
    })();
  }, [dispatch, search]);

  return (
    <MainLayout>
      <div className="container">
        <div>
          <div className="display-6 mt-4 mb-4">
            HDS Prototype: Error Reports Pareto
          </div>
        </div>
        <ErrorParetos />
      </div>
    </MainLayout>
  );
}

ErrorReportPareto.propTypes = {};

export default ErrorReportPareto;
