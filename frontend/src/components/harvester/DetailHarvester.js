import { useSelector } from "react-redux";
import HarvesterDetailTable from "../tables/HarvesterDetailTable";
import RecentHarvErrors from "./RecentHarvErrors";
import SchemaTabsView from "./SchemaTabsView";

function DetailHarvester(props) {
  const { harvester } = useSelector((state) => state.harvester);
  return (
    <>
      <HarvesterDetailTable harvester={harvester} />
      <RecentHarvErrors />
      <SchemaTabsView harvester={harvester} />
    </>
  );
}

DetailHarvester.propTypes = {};

export default DetailHarvester;
