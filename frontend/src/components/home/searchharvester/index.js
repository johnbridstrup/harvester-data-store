import { useState } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { queryHarvester } from "features/harvester/harvesterSlice";
import HomeSearch from "./HomeSearch";
import MenuSearch from "./MenuSearch";
import { THEME_MODES } from "features/base/constants";
import "./styles.css";

function SearchHarvester(props) {
  const [search, setSearch] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearch = async () => {
    const res = await dispatch(
      queryHarvester({
        harv_id: search,
      })
    );
    if (res.payload?.count === 1) {
      let harvId = res.payload?.results[0]?.id;
      navigate(`/harvesters/${harvId}?harv_id=${search}`);
    } else {
      toast.error("searched harvester does not exist", {
        theme: props.theme === THEME_MODES.AUTO_THEME ? "colored" : props.theme,
      });
    }
  };

  const Component =
    props.component === "navbar" ? (
      <MenuSearch handleChange={handleChange} handleKeyDown={handleKeyDown} />
    ) : props.component === "homepage" ? (
      <HomeSearch
        handleChange={handleChange}
        handleKeyDown={handleKeyDown}
        handleSearch={handleSearch}
        theme={props.theme}
      />
    ) : (
      <></>
    );

  return Component;
}

SearchHarvester.propTypes = {
  component: PropTypes.string.isRequired,
  theme: PropTypes.string,
};

export default SearchHarvester;
