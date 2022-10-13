import { useState } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { queryHarvester } from "../../../features/harvester/harvesterSlice";
import HomeSearch from "./HomeSearch";
import MenuSearch from "./MenuSearch";
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
      toast.error("searched harvester does not exist");
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
      />
    ) : (
      <></>
    );

  return Component;
}

SearchHarvester.propTypes = {
  component: PropTypes.string.isRequired,
};

export default SearchHarvester;
