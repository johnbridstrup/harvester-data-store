import { useSelector } from "react-redux";
import { LoaderDiv } from "components/styled";
import { handleDownload } from "utils/services";
import { GenericEvent } from "./Helpers";
import { Loader } from "utils/utils";

function PickSessionList(props) {
  const { picksessions, loading } = useSelector((state) => state.event);
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
        <GenericEvent
          data={picksessions}
          handleDownload={handleDownloadFiles}
          link="picksessions"
          theme={theme}
        />
      )}
    </>
  );
}

PickSessionList.propTypes = {};

export default PickSessionList;
