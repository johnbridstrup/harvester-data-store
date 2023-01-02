import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { BackButton } from "components/errorreports/ErrorHelpers";
import ErrorParetos from "components/errorreports/ErrorParetos";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import { generatePareto } from "features/errorreport/errorreportSlice";
import { paramsToObject } from "utils/utils";
import "./styles.css";

function ErrorReportPareto(props) {
  const dispatch = useDispatch();
  const { search } = useLocation();
  const paramsObj = paramsToObject(search);

  useEffect(() => {
    (async () => {
      dispatch(generatePareto(paramsObj));
    })();
  }, [dispatch, paramsObj]);

  return (
    <MainLayout>
      <div className="container">
        <BackButton paramsObj={paramsObj} />
        <Header title={"Error Pareto"} className={"display-6 mb-4"} />
        <ErrorParetos />
      </div>
    </MainLayout>
  );
}

ErrorReportPareto.propTypes = {};

export default ErrorReportPareto;
