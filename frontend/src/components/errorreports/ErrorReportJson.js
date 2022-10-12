import { useState } from "react";
import PropTypes from "prop-types";
import ReactJson from "@microlink/react-json-view";
import { JsonDiv } from "../styled";

function ErrorReportJson(props) {
  const [toggleOpen, setToggleOpen] = useState(false);

  const handleOpenJson = () => {
    setToggleOpen(!toggleOpen);
    setTimeout(() => {
      window.scrollTo(
        0,
        document.body.scrollHeight || document.documentElement.scrollHeight
      );
    }, 100);
  };

  const exportJson = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(props.reportObj?.report)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "data.json";
    link.click();
  };

  return (
    <>
      <div>
        <span onClick={handleOpenJson} className="btn btn-default">
          {toggleOpen ? "Hide" : "Show"} JSON <i className="las la-code"></i>
        </span>
        <span onClick={exportJson} className="btn btn-default mx-2">
          Download <i className="las la-download"></i>
        </span>
      </div>
      {toggleOpen && (
        <div className="mt-2">
          <JsonDiv>
            <ReactJson
              src={props.reportObj?.report}
              collapsed={3}
              thme="monokai"
              enableClipboard
            />
          </JsonDiv>
        </div>
      )}
    </>
  );
}

ErrorReportJson.propTypes = {
  reportObj: PropTypes.object,
};

export default ErrorReportJson;
