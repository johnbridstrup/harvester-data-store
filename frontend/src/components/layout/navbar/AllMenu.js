import { useState } from "react";
import PropTypes from "prop-types";
import { menu, adminMenu } from "../../../assets/menu";
import AllMenuItem from "./AllMenuItem";
import SearchHarvester from "../../home/searchharvester";

function AllMenu(props) {
  const menus = props.user?.is_superuser ? adminMenu : menu;
  const [searched, setSearched] = useState(menus);
  const handleChange = (e) => {
    let value = e.target.value;
    let filtered = value
      ? menus.filter((x, i) =>
          x.name.toLowerCase().includes(value.toLowerCase())
        )
      : menus;
    setSearched((current) => filtered);
  };
  return (
    <div className="all-menu">
      <div className="all-menu-header">Menu</div>
      <div className="all-menu-wrap scrollbar">
        <div className="all-left">
          <div className="all-menu-search">
            <i className="las la-search"></i>
            <input
              type="text"
              name="search"
              placeholder="Search Menu"
              onChange={handleChange}
            />
          </div>
          <div className="all-menu-group">
            <SearchHarvester component="navbar" />
          </div>
          <div className="all-menu-group">
            <div className="all-menu-group-header">HDS</div>
            {searched.map((item, index) => (
              <AllMenuItem
                key={index}
                name={item.name}
                description={item.description}
                icon={item.icon}
                href={item.href}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

AllMenu.propTypes = {
  user: PropTypes.object,
};

export default AllMenu;
