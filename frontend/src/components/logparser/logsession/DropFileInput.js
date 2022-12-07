import { useRef, useState } from "react";

function DropFileInput(props) {
  const [fileObj, setFileObj] = useState(null);
  const loading = false;
  const wrapperRef = useRef(null);

  const onDragEnter = () => wrapperRef.current.classList.add("dragover");

  const onDragLeave = () => wrapperRef.current.classList.remove("dragover");

  const onDrop = () => wrapperRef.current.classList.remove("dragover");

  const onFileChange = (file) => {
    setFileObj((current) => file);
  };

  const onFileRemove = () => {
    setFileObj((current) => null);
  };

  const handleSubmit = async () => {
    if (fileObj) {
      const formData = new FormData();
      formData.append("zip_upload", fileObj);
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      console.log(config);
      console.log("uploading zip file");
    }
    return;
  };

  return (
    <div className="drag-n-drop">
      <div
        ref={wrapperRef}
        className="drop-file-input"
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="label">
          <img src={`../../../icons/cloud-upload.png`} alt="" />
          <p>Drag & Drop your files here</p>
        </div>
        <input
          type="file"
          value=""
          accept=".zip"
          onChange={(e) => onFileChange(e.target.files[0])}
        />
      </div>
      {fileObj && (
        <div className="drop-file-preview">
          <p className="title">Ready to upload</p>
          <div className="item">
            <img src={`../../../icons/file-blank.png`} alt="" />
            <div className="item-info">
              <p>{fileObj.name}</p>
              <p>{fileObj.size}B</p>
            </div>
            <span className="item-del" onClick={onFileRemove}>
              x
            </span>
          </div>
          <div className="text-center mt-4">
            <button
              onClick={handleSubmit}
              className="btn btn-sm btn-primary"
              disabled={loading}
            >
              {loading ? "uploading.." : "Upload"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

DropFileInput.propTypes = {};

export default DropFileInput;
