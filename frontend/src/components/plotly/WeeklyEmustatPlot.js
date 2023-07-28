import PropTypes from "prop-types";
import Plotly from "react-plotly.js";
import { useMediaQuery } from "react-responsive";

function EmustatsPlot(props) {
  const { theme, traces, title, ylabel } = props;
  const paper_bgcolor = theme === "dark" ? "#343434" : "#fff";
  const plot_bgcolor = theme === "dark" ? "#343434" : "#fff";
  const color = theme === "dark" ? "#fff" : "#444";
  const lg = useMediaQuery({
    query: `(min-width: 1170px)`,
  });
  const md = useMediaQuery({
    query: `(min-width: 850px)`,
  });
  const width = lg ? 1080 : md ? 700 : 400;

  const layout = {
    title: title,
    showlegend: true,
    legend: {
      title: {
        text: "Week",
      },
    },
    autosize: false,
    width: width,
    height: 400,
    xaxis: {
      title: "scene",
    },
    yaxis: {
      title: ylabel,
    },
    paper_bgcolor: paper_bgcolor,
    plot_bgcolor: plot_bgcolor,
    font: {
      color: color,
    },
  };

  return <Plotly data={traces} layout={layout} />;
}

EmustatsPlot.propTypes = {
  theme: PropTypes.string,
  title: PropTypes.string,
  ylabel: PropTypes.string,
  traces: PropTypes.array,
};

export default EmustatsPlot;
