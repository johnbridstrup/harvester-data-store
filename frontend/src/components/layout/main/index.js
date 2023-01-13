import { useState } from "react";
import { useDispatch } from "react-redux";
import useThemeSetter from "hooks/themeSetter";
import { isBrowserDefaultDark } from "utils/utils";
import { setAppTheme } from "features/home/homeSlice";
import Navbar from "../navbar";

function MainLayout(props) {
  const dispatch = useDispatch();
  const [theme, setTheme] = useState(() => {
    let mode = localStorage.getItem("theme");
    if (mode === "auto" && isBrowserDefaultDark()) {
      return "dark";
    }
    if (mode === "auto") {
      return mode;
    } else {
      return "light";
    }
  });

  useThemeSetter((themeMode) => {
    setTheme(themeMode);
    dispatch(setAppTheme(themeMode));
  });

  const handleThemeChange = (mode) => {
    setTheme((current) => mode);
    localStorage.setItem("theme", mode);
  };

  return (
    <>
      <Navbar theme={theme} handleThemeChange={handleThemeChange} />
      <div className="main-layout">{props.children}</div>
    </>
  );
}

MainLayout.propTypes = {};

export default MainLayout;
