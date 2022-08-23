import { lazy, Suspense } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Loader, paramsToObject } from "../../utils/utils";
import { LoaderDiv } from "../styled";
import { ParetoTabular } from "./ErrorHelpers";
const ParetoPlot = lazy(() => import("../plotly/ParetoPlot"));

function ErrorParetos(props) {
  const { paretos, loading } = useSelector((state) => state.errorreport);
  const { search } = useLocation();
  const paramsObj = paramsToObject(search);
  const dataArr = paretos.slice();
  dataArr.sort((a, b) => (a.count > b.count ? -1 : b.count > a.count ? 1 : 0));
  const xlabels = dataArr.map((pareto, index) => {
    return pareto.value;
  });
  const ydata = dataArr.map((pareto, index) => {
    return pareto.count;
  });

  return (
    <div className="row mt-4">
      <div className="col-md-4">
        <ParetoTabular paramsObj={paramsObj} />
      </div>
      <div className="col-md-8">
        {loading ? (
          <LoaderDiv>
            <Loader size={50}></Loader>
          </LoaderDiv>
        ) : (
          <Suspense
            fallback={
              <LoaderDiv>
                <Loader size={25} />
              </LoaderDiv>
            }
          >
            <ParetoPlot xlabels={xlabels} ydata={ydata} />
          </Suspense>
        )}
      </div>
    </div>
  );
}

ErrorParetos.propTypes = {};

export default ErrorParetos;
