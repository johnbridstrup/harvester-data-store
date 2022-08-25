import { lazy, Suspense, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Loader, paramsToObject } from "../../utils/utils";
import { LoaderDiv, SidePane } from "../styled";
import { ParetoTabular } from "./ErrorHelpers";
const ParetoPlot = lazy(() => import("../plotly/ParetoPlot"));

function ErrorParetos(props) {
  const [open, setOpen] = useState(false);
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

  const handleSideClick = () => {
    setOpen(!open);
  };

  return (
    <div>
      <div className="mb-2">
        <span onClick={handleSideClick} className="btn cursor">
          {open ? "Hide" : "Show"} Parameters
        </span>
      </div>
      <div className="sidenav">
        <SidePane open={open}>
          <div className="sidecontent">
            {open && <ParetoTabular paramsObj={paramsObj} />}
          </div>
        </SidePane>
      </div>
      <div className={`row ${open ? "mainchart" : "minus-side"}`}>
        <div className="col-md-6">
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
              <ParetoPlot
                xlabels={xlabels}
                ydata={ydata}
                chart_title={paramsObj.chart_title}
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}

ErrorParetos.propTypes = {};

export default ErrorParetos;
