import Plotly from "react-plotly.js";
import PropTypes from "prop-types";

function ChronyInfoPlot(props) {
  const red = "rgb(230, 2, 2)";
  const yellow = "rgb(227, 220, 5)";
  const green = "rgb(72, 191, 8)";

  const labels = ["Last Offset", "RMS Offset"];

  const layout = {
    autosize: false,
    width: 400,
    height: 300,
    margin: {
      l: 70,
      r: 0,
      b: 50,
      t: 30,
      pad: 0,
    },
    xaxis: {
      type: "log",
      range: [-10, 1.5],
      title: "seconds",
    },
  };

  function masterColor(offsetSeconds) {
    let offset = Math.abs(offsetSeconds);
    if (offset < 1) {
      return green;
    } else if (offset < 10) {
      return yellow;
    } else {
      return red;
    }
  }

  function robotColor(offsetSeconds) {
    let offset = Math.abs(offsetSeconds);
    if (offset < 0.1) {
      return green;
    } else if (offset < 1) {
      return yellow;
    } else {
      return red;
    }
  }

  function makeChronyData(lastOffset, rmsOffset) {
    const data = [
      {
        type: "bar",
        x: [Math.abs(lastOffset), rmsOffset],
        y: labels,
        orientation: "h",
        marker: {
          color:
            props.robot === "Master"
              ? [masterColor(lastOffset), masterColor(rmsOffset)]
              : [robotColor(lastOffset), robotColor(rmsOffset)],
        },
      },
    ];
    return data;
  }

  return (
    <Plotly
      data={makeChronyData(
        props.chronyInfo?.last_offset,
        props.chronyInfo?.rms_offset
      )}
      layout={layout}
    />
  );
}

ChronyInfoPlot.propTypes = {
  chronyInfo: PropTypes.object,
  robot: PropTypes.string,
};

export default ChronyInfoPlot;
