import PropTypes from "prop-types";
import Plotly from "react-plotly.js";
import { useMediaQuery } from "react-responsive";

function EmustatSceneScatter(props) {
  const { ydata, ylabel, xdata, hovers, title, theme } = props;
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
    showlegend: false,
    autosize: false,
    width: width,
    height: 400,
    xaxis: {
      title: "report time",
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

  const data = [
    {
      y: ydata,
      x: xdata,
      type: "scatter",
      mode: "markers",
      marker: {
        color: "rgb(142,124,195)",
      },
      text: hovers,
    },
  ];

  return <Plotly data={data} layout={layout} />;
}

EmustatSceneScatter.propTypes = {
  ydata: PropTypes.array,
  xdata: PropTypes.array,
  hovers: PropTypes.array,
  ylabel: PropTypes.string,
  xlabel: PropTypes.string,
  title: PropTypes.string,
  theme: PropTypes.string,
};

export default EmustatSceneScatter;
