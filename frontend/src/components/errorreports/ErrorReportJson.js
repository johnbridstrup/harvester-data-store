import { useState, useRef } from "react";
import PropTypes from "prop-types";
import ReactJson from "@microlink/react-json-view";
import { JsonDiv } from "../styled";
import DownloadModal from "../modals/DownloadModal";

function ErrorReportJson(props) {
  const [toggleOpen, setToggleOpen] = useState(false);
  const downloadRef = useRef();

  const downloadFilesPopUp = () => {
    downloadRef.current.click();
  };

  const handleDownloadFiles = async (fileObj) => {
    console.log(fileObj);
  };

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
      JSON.stringify(props.reportObj)
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
        <span onClick={downloadFilesPopUp} className="btn btn-default mx-2">
          Get Files
        </span>
        <button
          ref={downloadRef}
          data-bs-toggle="modal"
          data-bs-target="#downloadModal"
          style={{ display: "none" }}
        >
          Get Files
        </button>
      </div>
      {toggleOpen && (
        <div className="mt-2">
          <JsonDiv>
            <ReactJson
              src={props.reportObj?.report}
              collapsed={true}
              thme="monokai"
              enableClipboard
            />
          </JsonDiv>
        </div>
      )}
      <DownloadModal
        eventObj={props.reportObj?.event}
        handleDownload={handleDownloadFiles}
      />
    </>
  );
}

ErrorReportJson.propTypes = {
  reportObj: PropTypes.object,
};

export default ErrorReportJson;
