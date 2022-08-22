import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { BackButton } from "../../../components/errorreports/ErrorHelpers";
import ErrorParetos from "../../../components/errorreports/ErrorParetos";
import Header from "../../../components/layout/header";
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
          <BackButton />
          <Header title={"Error Pareto"} className={"display-6 mb-4"} />
        </div>
        <ErrorParetos />
      </div>
    </MainLayout>
  );
}

ErrorReportPareto.propTypes = {};

export default ErrorReportPareto;
