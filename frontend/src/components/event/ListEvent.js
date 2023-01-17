import { useSelector } from "react-redux";
import { handleDownload } from "utils/services";
import { Loader } from "utils/utils";
import { LoaderDiv } from "../styled";
import EventTable from "../tables/EventTable";

function ListEvent(props) {
  const { events, loading } = useSelector((state) => state.event);
  const { token } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.home);

  const handleDownloadFiles = async (fileObj) => {
    await handleDownload(fileObj, token);
  };

  return (
    <>
      {loading ? (
        <LoaderDiv>
          <Loader size={50} />
        </LoaderDiv>
      ) : (
        <EventTable
          events={events}
          handleDownload={handleDownloadFiles}
          theme={theme}
        />
      )}
    </>
  );
}

ListEvent.propTypes = {};

export default ListEvent;
