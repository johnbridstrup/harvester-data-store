import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { BackButton } from "components/errorreports/ErrorHelpers";
import ErrorParetos from "components/errorreports/ErrorParetos";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import { generatePareto } from "features/errorreport/errorreportSlice";
import { paramsToObject } from "utils/utils";
import { listHarvesters } from "features/harvester/harvesterSlice";
import { listLocations } from "features/location/locationSlice";
import { listFruits } from "features/fruit/fruitSlice";
import { listCodes } from "features/excecode/codeSlice";
import { MAX_LIMIT } from "features/base/constants";
import "./styles.css";

function ErrorReportPareto(props) {
  const { theme } = useSelector((state) => state.home);
  const dispatch = useDispatch();
  const { search } = useLocation();
  const paramsObj = paramsToObject(search);

  useEffect(() => {
    (async () => {
      dispatch(generatePareto(paramsObj));
      await Promise.all([
        dispatch(listHarvesters(MAX_LIMIT)),
        dispatch(listLocations(MAX_LIMIT)),
        dispatch(listFruits(MAX_LIMIT)),
        dispatch(listCodes(MAX_LIMIT)),
      ]);
    })();
  }, [dispatch, paramsObj]);

  return (
    <MainLayout>
      <div className="container">
        <BackButton paramsObj={paramsObj} theme={theme} />
        <Header title={"Error Pareto"} className={"display-6 mb-4"} />
        <ErrorParetos />
      </div>
    </MainLayout>
  );
}

ErrorReportPareto.propTypes = {};

export default ErrorReportPareto;
