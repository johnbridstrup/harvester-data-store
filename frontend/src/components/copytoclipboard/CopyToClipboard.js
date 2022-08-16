import { useState } from "react";
import { useSelector } from "react-redux";
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

CopyToClipboard.propTypes = {};

export default CopyToClipboard;
