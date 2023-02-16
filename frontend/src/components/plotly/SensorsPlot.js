import PropTypes from "prop-types";
import Plotly from "react-plotly.js";
import { useMediaQuery } from "react-responsive";

function SensorsPlot(props) {
  const { theme, sensordata } = props;
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

  const mapTraces = () => {
    return (
      sensordata?.ts_interval?.map((x) => {
        return {
          type: "scatter",
          x: [x.x0, x.x1, x.x1, x.x0],
          y: [x.min, x.min, x.max, x.max],
          fill: "toself",
          opacity: 0.3,
          name: x.state,
          line: {
            width: 3,
          },
        };
      }) || []
    );
  };

  const layout = {
    showlegend: false,
    autosize: false,
    width: width,
    height: 400,
    paper_bgcolor: paper_bgcolor,
    plot_bgcolor: plot_bgcolor,
    font: {
      color: color,
    },
  };

  const data = [
    {
      y: sensordata.values,
      x: sensordata.timestamps,
      type: "line",
      mode: "lines+markers",
      marker: {
        color: "rgb(142,124,195)",
      },
      text: sensordata.states,
      line: {
        width: 3,
        shape: "spline",
      },
    },
    ...mapTraces(),
  ];

  return <Plotly data={data} layout={layout} />;
}

SensorsPlot.propTypes = {
  sensordata: PropTypes.object,
  theme: PropTypes.string,
};

export default SensorsPlot;
