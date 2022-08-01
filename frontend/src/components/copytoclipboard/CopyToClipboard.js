import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { ClipboardDiv } from "../styled";


function CopyToClipboard(props) {
  const [copied, setCopied] = useState(false);
  const { queryUrl } = useSelector(state => state.errorreport);
  const copyURL = async () => {
    if (typeof queryUrl === "string" && queryUrl.length > 0) {
      try {
        await navigator.clipboard.writeText(queryUrl)
        setCopied(true)
      } catch (error) {
        console.log("error", error)
      }
      setTimeout(function(){
        setCopied(false)
      }, 3000);
    } else {
      toast.error("could not copy the query url");
    }
  }
  return (
    <ClipboardDiv>
      <button onClick={copyURL} className="btn">{copied ? <span className="las la-check-double text-success">copied</span>: "copy query"}</button>
    </ClipboardDiv>
  )
}


CopyToClipboard.propTypes = {};

export default CopyToClipboard;
