import { useEffect } from "react";
import { isBrowserDefaultDark } from "utils/utils";

function useThemeSetter(callback) {
  const theme = localStorage.getItem("theme");
  useEffect(() => {
    if ((theme === "auto" && isBrowserDefaultDark()) || theme === "dark") {
      callback("dark");
      document.documentElement.setAttribute("data-bs-theme", "dark");
      document.getElementById("main")?.classList?.add("dark-theme");
    } else if (theme === "auto") {
      document.getElementById("main")?.classList?.remove("dark-theme");
      document.documentElement.setAttribute("data-bs-theme", "auto");
      callback("auto");
    } else {
      document.getElementById("main")?.classList?.remove("dark-theme");
      document.documentElement.setAttribute("data-bs-theme", "light");
      callback("light");
    }
  }, [theme, callback]);
}

export default useThemeSetter;
