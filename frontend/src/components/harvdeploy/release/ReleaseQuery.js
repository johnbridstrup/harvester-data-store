import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { queryRelease } from "features/harvdeploy/harvdeploySlice";
import {
  handleSelectFactory,
  transformFruitOptions,
  transformTagsOptions,
} from "utils/utils";

function ReleaseQuery(props) {
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [selectedTag, setSelectTag] = useState(null);
  const { tags } = useSelector((state) => state.harvdeploy);
  const { fruits } = useSelector((state) => state.fruit);
  const dispatch = useDispatch();
  const fruitOptions = transformFruitOptions(fruits);
  const tagOptions = transformTagsOptions(tags);

  const handleFruitSelect = handleSelectFactory(setSelectedFruit);
  const handleTagSelect = handleSelectFactory(setSelectTag);

  const handleFormQuerySubmit = async (e) => {
    e.preventDefault();
    const queryObj = {};

    if (selectedFruit && selectedFruit.hasOwnProperty("value")) {
      queryObj["fruit"] = selectedFruit.value;
    }
    if (selectedTag && selectedTag.hasOwnProperty("value")) {
      queryObj["tags"] = selectedTag.value;
    }

    await dispatch(queryRelease(queryObj));
  };

  return (
    <div>
      <form onSubmit={handleFormQuerySubmit}>
        <div className="row mb-2">
          <div className="col">
            <div className="form-group">
              <label htmlFor="fruit">Fruit</label>
              <Select
                isSearchable
                isClearable
                placeholder="strawberry"
                options={fruitOptions}
                name="strawberry"
                onChange={handleFruitSelect}
                defaultValue={selectedFruit}
                value={selectedFruit}
                className="multi-select-container"
                classNamePrefix="select"
              />
            </div>
          </div>
        </div>
        <div className="row mb-2">
          <div className="col">
            <div className="form-group">
              <label htmlFor="tags">Tags</label>
              <Select
                isSearchable
                isClearable
                placeholder="Invalid"
                options={tagOptions}
                name="tags"
                onChange={handleTagSelect}
                defaultValue={selectedTag}
                value={selectedTag}
                className="multi-select-container"
                classNamePrefix="select"
              />
            </div>
          </div>
        </div>
        <div className="form-group mb-4 mt-3">
          <button className="btn btn-primary">Submit</button>
        </div>
      </form>
    </div>
  );
}

ReleaseQuery.propTypes = {};

export default ReleaseQuery;
