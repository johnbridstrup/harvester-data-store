import { lazy, Suspense } from "react";
import { useSelector } from "react-redux";
import { Loader } from "../../utils/utils";
import { LoaderDiv } from "../styled";
const ParetoPlot = lazy(() => import("../plotly/ParetoPlot"));

function ErrorParetos(props) {
  const { paretos, loading } = useSelector((state) => state.errorreport);
  const dataArr = paretos.slice();
  dataArr.sort((a, b) => (a.count > b.count ? -1 : b.count > a.count ? 1 : 0));
  const xlabels = dataArr.map((pareto, index) => {
    return pareto.value;
  });
  const ydata = dataArr.map((pareto, index) => {
    return pareto.count;
  });

  return (
    <div className="row">
      <div className="col-md-6 mx-auto mt-4">
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
