import PropTypes from "prop-types";
import Plotly from "react-plotly.js";

function ParetoPlot(props) {
  const paper_bgcolor = props.theme === "dark" ? "#343434" : "#fff";
  const plot_bgcolor = props.theme === "dark" ? "#343434" : "#fff";
  const color = props.theme === "dark" ? "#fff" : "#444";

  const layout = {
    title: props.chart_title || "Exceptions",
    showlegend: false,
    autosize: false,
    width: 400,
    height: 400,
    xaxis: {
      type: "category",
      automargin: true,
    },
    paper_bgcolor: paper_bgcolor,
    plot_bgcolor: plot_bgcolor,
    font: {
      color: color,
    },
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
  theme: PropTypes.string,
};

export default ParetoPlot;
