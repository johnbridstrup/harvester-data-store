import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { InputFormControl } from "components/styled";
import {
  handleSelectFactory,
  selectDarkStyles,
  transformTagsOptions,
} from "utils/utils";
import { THEME_MODES } from "features/base/constants";
import { queryS3File } from "features/s3file/s3fileSlice";

function S3FileQuery(props) {
  const [fieldData, setFieldData] = useState({
    name: "",
    filetype: "",
  });
  const [selectedTag, setSelectedTag] = useState(null);
  const { theme } = useSelector((state) => state.home);
  const { tags } = useSelector((state) => state.event);
  const dispatch = useDispatch();
  const customStyles = theme === THEME_MODES.DARK_THEME ? selectDarkStyles : {};
  const tagOptions = transformTagsOptions(tags);

  const handleFieldChange = (e) => {
    setFieldData((current) => {
      return { ...current, [e.target.name]: e.target.value };
    });
  };
  const handleTagSelect = handleSelectFactory(setSelectedTag);

  const buildQueryObj = () => {
    let queryObj = {};
    if (fieldData.name) {
      queryObj["key"] = fieldData.name;
    }
    if (fieldData.filetype) {
      queryObj["filetype"] = fieldData.filetype;
    }
    if (selectedTag && selectedTag.every((x) => x.hasOwnProperty("value"))) {
      queryObj["tags"] = selectedTag.map((x) => x.value).join(",");
    }
    return queryObj;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    let queryObj = buildQueryObj();
    dispatch(queryS3File(queryObj));
  };

  return (
    <div className="mt-4 mb-4">
      <form onSubmit={handleFormSubmit}>
        <div className="form-group mb-3">
          <label htmlFor="name">Name</label>
          <InputFormControl
            type="text"
            name="name"
            id="name"
            value={fieldData.name}
            theme={theme}
            onChange={handleFieldChange}
            placeholder="sessclip_dev001_R3"
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="filetype">File Type</label>
          <InputFormControl
            type="text"
            name="filetype"
            id="filetype"
            value={fieldData.filetype}
            theme={theme}
            onChange={handleFieldChange}
            placeholder="zip"
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="tags">Tags</label>
          <Select
            isSearchable
            isClearable
            isMulti
            placeholder="incomplete"
            options={tagOptions}
            name="tags"
            id="tags"
            onChange={handleTagSelect}
            defaultValue={selectedTag}
            value={selectedTag}
            className="multi-select-container"
            classNamePrefix="select"
            styles={customStyles}
          />
        </div>
        <div className="form-group text-center">
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

S3FileQuery.propTypes = {};

export default S3FileQuery;
