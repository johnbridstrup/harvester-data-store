import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { InputFormControl } from "components/styled";
import useClickOutside from "hooks/clickOutSide";
import { transformTags } from "utils/utils";
import { listTags, updateRelease } from "features/harvdeploy/harvdeploySlice";

function Tags(props) {
  const [fieldData, setFieldData] = useState({
    tag: "",
    tagArr: [],
  });
  const [openModal, setOpenModal] = useState(false);
  const [createNew, setCreateNew] = useState(false);
  const tagRef = useRef();
  const dispatch = useDispatch();
  const allTags = transformTags(props.allTags);
  const [tags, setTags] = useState(allTags);

  useClickOutside(tagRef, async () => {
    setOpenModal(false);
    if (fieldData.tagArr.length > 0) {
      let data = {
        ...props.release?.release,
        id: props.release?.id,
        tags: fieldData.tagArr,
      };
      await dispatch(updateRelease(data));
    }
  });

  const handleTagClick = (tag) => {
    let index = tags.findIndex((x) => x.id === tag.id);
    let obj = tags.find((x) => x.id === tag.id);
    if (obj?.checked) {
      let oldTags = [...fieldData.tagArr];
      let oldIndex = oldTags.findIndex((x) => x === obj.name);
      oldTags.splice(oldIndex, 1);
      setFieldData((current) => {
        return { ...current, tagArr: oldTags };
      });
      obj.checked = false;
    } else {
      obj.checked = true;
      let tagData = [...fieldData.tagArr, obj.name];
      setFieldData((current) => {
        return { ...current, tagArr: tagData };
      });
    }
    let cloned = [...tags];
    cloned[index] = obj;
    setTags((current) => cloned);
  };

  const handleOpenModal = () => {
    setOpenModal((prev) => !prev);
  };

  const handleFieldChange = (e) => {
    setFieldData((current) => {
      return { ...current, [e.target.name]: e.target.value };
    });
    let filtered = e.target.value
      ? allTags.filter((x) => x.name.toLowerCase().includes(e.target.value))
      : allTags;
    setTags((current) => filtered);
    if (filtered.length === 0) {
      setCreateNew(true);
    } else {
      setCreateNew(false);
    }
  };

  const handleTagRemove = async (tag) => {
    let newTags = [...props.release?.tags];
    let index = newTags.findIndex((x) => x === tag);
    newTags.splice(index, 1);
    let data = {
      ...props.release?.release,
      id: props.release?.id,
      tags: newTags,
    };
    await dispatch(updateRelease(data));
    await dispatch(listTags());
    setTags((current) => allTags);
  };

  const handleCreateNewTag = async () => {
    let data = {
      ...props.release?.release,
      id: props.release?.id,
      tags: [...props.release?.tags, fieldData.tag],
    };
    await dispatch(updateRelease(data));
    await dispatch(listTags());
    setOpenModal(false);
    setCreateNew(false);
    setFieldData((current) => {
      return { ...current, tag: "" };
    });
    setTags((current) => allTags);
  };

  return (
    <div className="tag-container">
      <div className="border-bottom mb-4">
        <span onClick={handleOpenModal} className="tag-color">
          Release Tags
        </span>
      </div>
      <div className="chips-wrap">
        {props.release?.tags?.map((x, index) => (
          <span key={index} className="text-secondary chips mx-2 mb-2">
            <span>{x}</span>{" "}
            <span className="mx-1">
              <i
                onClick={() => handleTagRemove(x)}
                className="las la-times"
              ></i>
            </span>
          </span>
        ))}
      </div>
      {openModal && (
        <div ref={tagRef} className="apply-tags">
          <div>
            <span className="apply-label-text">Apply tags to this release</span>
          </div>
          <div>
            <InputFormControl
              type="text"
              name="tag"
              value={fieldData.tag}
              onChange={handleFieldChange}
              placeholder="filter tags"
            />
          </div>
          <div className="available-tags scrollbar">
            {tags.map((x, _) => (
              <div
                key={x.id}
                onClick={() => handleTagClick(x)}
                className="text-secondary tags-name hover2"
              >
                <span>
                  {x.checked ? (
                    <i className="las la-check mx-2"></i>
                  ) : (
                    <i className="mx-2"></i>
                  )}
                  {x.name}
                </span>
                <span>{x.checked && <i className="las la-times"></i>}</span>
              </div>
            ))}
            {createNew && (
              <div
                onClick={handleCreateNewTag}
                className="text-secondary tags-name hover2 cursor"
              >
                <span className="mx-2">Create new tag "{fieldData.tag}"</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

Tags.propTypes = {
  release: PropTypes.object,
  allTags: PropTypes.array,
};

export default Tags;
