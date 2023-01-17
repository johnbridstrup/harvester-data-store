import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { darkThemeClass, imagePath } from "utils/utils";
import { SUCCESS, THEME_MODES } from "features/base/constants";
import {
  createLogSession,
  listLogSession,
} from "features/logparser/logparserSlice";

function DropFileInput(props) {
  const [fileObj, setFileObj] = useState(null);
  const { uploading } = useSelector((state) => state.logparser);
  const { theme } = useSelector((state) => state.home);
  const wrapperRef = useRef(null);
  const dispatch = useDispatch();

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
      const res = await dispatch(createLogSession(formData));
      if (res.payload?.status === SUCCESS) {
        setFileObj(null);
        toast.success(res.payload?.message, {
          theme: theme === THEME_MODES.AUTO_THEME ? "colored" : theme,
        });
        await dispatch(listLogSession());
      } else {
        toast.error(res?.payload, {
          theme: theme === THEME_MODES.AUTO_THEME ? "colored" : theme,
        });
      }
    }
  };

  const dragtheme = darkThemeClass("dt-drag-n-drop", theme);
  const fileinput = darkThemeClass("dt-drop-file-input", theme);

  return (
    <div className={`drag-n-drop ${dragtheme}`}>
      <div
        ref={wrapperRef}
        className={`drop-file-input ${fileinput}`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="label">
          <img src={imagePath("cloud-upload")} alt="cloud-upload" />
          <p>Drag & Drop your files here</p>
        </div>
        <input
          type="file"
          value=""
          accept=".zip"
          data-testid="fileDropZone"
          onChange={(e) => onFileChange(e.target.files[0])}
        />
      </div>
      {fileObj && (
        <div className="drop-file-preview">
          <p className={`title ${dragtheme && "text-white"}`}>
            Ready to upload
          </p>
          <div className="item">
            <img src={imagePath("file-blank")} alt="file-blank" />
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
              disabled={uploading}
            >
              {uploading ? "uploading.." : "Upload"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

DropFileInput.propTypes = {};

export default DropFileInput;
