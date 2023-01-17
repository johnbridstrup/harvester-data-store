import { useSelector } from "react-redux";
import HarvesterDetailTable from "../tables/HarvesterDetailTable";
import RecentHarvErrors from "./RecentHarvErrors";
import SchemaTabsView from "./SchemaTabsView";

function DetailHarvester(props) {
  const { harvester } = useSelector((state) => state.harvester);
  const { theme } = useSelector((state) => state.home);
  return (
    <>
      <HarvesterDetailTable harvester={harvester} theme={theme} />
      <RecentHarvErrors />
      <SchemaTabsView harvester={harvester} theme={theme} />
    </>
  );
}

DetailHarvester.propTypes = {};

export default DetailHarvester;
