import PropTypes from "prop-types";
import Plotly from "react-plotly.js";

function ParetoPlot(props) {
  const layout = {
    title: props.chart_title,
    showlegend: false,
    autosize: false,
    width: 400,
    height: 400,
  };
  const data = [
    {
      x: props.xlabels,
      y: props.ydata,
      type: "bar",
      marker: {
        color: "rgb(142,124,195)",
      },
    },
  ];
  return (
    <Plotly data={data} layout={layout} style={{ width: "100% !important" }} />
  );
}

ParetoPlot.propTypes = {
  xlabels: PropTypes.array,
  ydata: PropTypes.array,
  chart_title: PropTypes.string,
};

export default ParetoPlot;
