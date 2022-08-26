import { lazy, Suspense, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { generatePareto } from "../../features/errorreport/errorreportSlice";
import {
  aggregateOptions,
  Loader,
  paramsToObject,
  uuid,
} from "../../utils/utils";
import { LoaderDiv, SidePane } from "../styled";
import { ParetoForm, ParetoTabular } from "./ErrorHelpers";
const ParetoPlot = lazy(() => import("../plotly/ParetoPlot"));

function ErrorParetos(props) {
  const [open, setOpen] = useState(false);
  const [selectedAggregate, setSelectedAggregate] = useState(null);
  const [paretoArr, setParetoArr] = useState([]);
  const { paretos, loading } = useSelector((state) => state.errorreport);
  const dispatch = useDispatch();
  const { search } = useLocation();
  const paramsObj = paramsToObject(search);

  useEffect(() => {
    const dataArr = paretos.slice();
    dataArr.sort((a, b) =>
      a.count > b.count ? -1 : b.count > a.count ? 1 : 0
    );
    const xlabels = dataArr.map((pareto, index) => {
      return pareto.value;
    });
    const ydata = dataArr.map((pareto, index) => {
      return pareto.count;
    });
    const option = aggregateOptions.find(
      (x, i) => x.value === paramsObj.aggregate_query
    );
    let paretoObj = {
      id: uuid(),
      paretos: { xlabels, ydata },
      aggregate_query: paramsObj.aggregate_query,
      chart_title: option?.label,
    };
    let arr = [paretoObj];
    setParetoArr((current) => arr);
  }, [paramsObj.aggregate_query, paretos]);

  const handleSideClick = () => {
    setOpen(!open);
  };

  const handleChange = (newValue, actionMeta) => {
    setSelectedAggregate((current) => newValue);
  };

  const handleBuildPareto = async (e) => {
    e.preventDefault();
    let aggregate_query;
    let chart_title;
    if (selectedAggregate && selectedAggregate.hasOwnProperty("value")) {
      aggregate_query = selectedAggregate.value;
      const option = aggregateOptions.find(
        (x, i) => x.value === aggregate_query
      );
      chart_title = option?.label;
    } else {
      aggregate_query = "code__name";
    }
    paramsObj["aggregate_query"] = aggregate_query;
    const res = await dispatch(generatePareto(paramsObj));
    if (res.type === "errorreport/generatePareto/fulfilled") {
      const dataArr = res?.payload.slice();
      dataArr.sort((a, b) =>
        a.count > b.count ? -1 : b.count > a.count ? 1 : 0
      );
      const xlabels = dataArr.map((pareto, index) => {
        return pareto.value;
      });
      const ydata = dataArr.map((pareto, index) => {
        return pareto.count;
      });
      let paretoObj = {
        id: uuid(),
        paretos: { xlabels, ydata },
        aggregate_query,
        chart_title,
      };
      let arr = paretoArr.slice();
      let exist = arr.find((x, i) => x.chart_title === chart_title);
      console.log(exist);
      if (!exist) {
        arr.push(paretoObj);
      }
      setParetoArr((current) => arr);
    }
  };

  const handleDeletePareto = (chart) => {
    let arr = paretoArr.slice();
    let index = arr.findIndex((x, i) => x.id === chart.id);
    arr.splice(index, 1);
    setParetoArr((current) => arr);
  };

  return (
    <div>
      <ParetoForm
        handleChange={handleChange}
        handleSubmit={handleBuildPareto}
        selectedAggregate={selectedAggregate}
      />
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
      {loading ? (
        <LoaderDiv>
          <Loader size={50}></Loader>
        </LoaderDiv>
      ) : (
        <div className={`row ${open ? "mainchart" : "minus-side"}`}>
          {paretoArr.map((obj, index) => (
            <div key={obj.id} className="col-md-6 plot-div">
              <Suspense
                fallback={
                  <LoaderDiv>
                    <Loader size={25} />
                  </LoaderDiv>
                }
              >
                <ParetoPlot
                  xlabels={obj.paretos.xlabels}
                  ydata={obj.paretos.ydata}
                  chart_title={obj.chart_title}
                />
              </Suspense>
              <span
                onClick={() => handleDeletePareto(obj)}
                className="delete-icon"
              >
                <i className="las la-times"></i>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

ErrorParetos.propTypes = {};

export default ErrorParetos;
