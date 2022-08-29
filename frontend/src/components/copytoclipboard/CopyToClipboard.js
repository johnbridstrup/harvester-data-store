import { useState } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { ClipboardDiv } from "../styled";

function CopyToClipboard(props) {
  const [copied, setCopied] = useState(false);
  const { queryUrl } = useSelector((state) => state.errorreport);
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (error) {
      console.log("error", error);
    }
    setTimeout(function () {
      setCopied(false);
    }, 3000);
  };
  const copyURL = async () => {
    if (typeof queryUrl === "string" && queryUrl.length > 0) {
      await copy(queryUrl);
    } else {
      let public_url =
        process.env.REACT_APP_HOSTED_URL || "http://localhost:3000";
      await copy(public_url + "/errorreports");
    }
  };
  return (
    <ClipboardDiv>
      <button onClick={copyURL} className="btn">
        {copied ? (
          <span className="las la-check-double text-success">copied</span>
        ) : (
          "copy query"
        )}
      </button>
    </ClipboardDiv>
  );
}

export const CopyBuildConfig = (props) => {
  const [copied, setCopied] = useState(false);
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (error) {
      console.log("error", error);
    }
    setTimeout(function () {
      setCopied(false);
    }, 3000);
  };

  const buildConfig = async () => {
    let config = props?.paretoArr.slice().map((pareto, index) => {
      return pareto.aggregate_query;
    });
    props.paramsObj["configs"] = config;
    let params = new URLSearchParams(props.paramsObj);
    let public_url =
      process.env.REACT_APP_HOSTED_URL || "http://localhost:3000";
    let configUrl = `/errorreports/view/pareto/?${params.toString()}`;
    await copy(public_url + configUrl);
  };

  return (
    <button onClick={buildConfig} className="btn mx-2">
      {copied ? (
        <span className="las la-check-double text-success">copied</span>
      ) : (
        "copy config"
      )}
    </button>
  );
};

CopyBuildConfig.propTypes = {
  paretoArr: PropTypes.array,
  paramsObj: PropTypes.object,
};

CopyToClipboard.propTypes = {};

export default CopyToClipboard;
