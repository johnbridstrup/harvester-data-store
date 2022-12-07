import MainLayout from "../../../../components/layout/main";
import Header from "../../../../components/layout/header";
import "./styles.css";
import DropFileInput from "../../../../components/logparser/logsession/DropFileInput";
import LogSessionList from "../../../../components/logparser/logsession/LogSessionList";

function LogSessionListView(props) {
  return (
    <MainLayout>
      <div className="container">
        <Header className={"display-4"} title={"LOG PARSER"} />
        <DropFileInput />
        <LogSessionList />
      </div>
    </MainLayout>
  );
}

LogSessionListView.propTypes = {};

export default LogSessionListView;
