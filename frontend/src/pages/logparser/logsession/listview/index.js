import { useDispatch } from "react-redux";
import { useEffect } from "react";
import MainLayout from "components/layout/main";
import Header from "components/layout/header";
import DropFileInput from "components/logparser/logsession/DropFileInput";
import LogSessionList from "components/logparser/logsession/LogSessionList";
import { listLogSession } from "features/logparser/logparserSlice";
import { GenericPagination } from "components/pagination/Pagination";
import "./styles.css";

function LogSessionListView(props) {
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      await dispatch(listLogSession());
    })();
  }, [dispatch]);

  return (
    <MainLayout>
      <div className="container">
        <Header className={"display-4"} title={"LOG PARSER"} />
        <DropFileInput />
        <LogSessionList />
        <GenericPagination state="logparser" />
      </div>
    </MainLayout>
  );
}

LogSessionListView.propTypes = {};

export default LogSessionListView;
