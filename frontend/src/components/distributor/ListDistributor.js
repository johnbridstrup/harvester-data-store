import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { SUCCESS } from "features/base/constants";
import {
  createDistributor,
  listDistributors,
  updateDistributor,
} from "features/distributor/distributorSlice";
import { Loader } from "utils/utils";
import DistributorModal from "../modals/DistributorModal";
import { LoaderDiv } from "../styled";
import DistributorTable from "../tables/DistributorTable";

function ListDistributor(props) {
  const [fieldData, setFieldData] = useState({
    name: "",
    mode: "add",
    objId: null,
  });
  const { distributors, loading } = useSelector((state) => state.distributor);
  const distributorRef = useRef();
  const dispatch = useDispatch();

  const addPopUp = (mode) => {
    if (typeof mode === "string" && mode === "add") {
      setFieldData((current) => {
        return { ...current, name: "", mode: "add", objId: null };
      });
    }
    distributorRef.current.click();
  };

  const handleFieldChange = (e) => {
    setFieldData((current) => {
      return { ...current, [e.target.name]: e.target.value };
    });
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    let data = {
      name: fieldData.name,
      objId: fieldData.objId,
    };
    const dispatchObj = {
      add: createDistributor,
      edit: updateDistributor,
    };

    const res = await dispatch(dispatchObj[fieldData.mode](data));
    if (res.payload?.status === SUCCESS) {
      await dispatch(listDistributors());
      toast.success(res?.payload?.message);
      addPopUp();
      setFieldData((current) => {
        return { ...current, name: "", mode: "add", objId: "" };
      });
    }
  };

  const handleDistUpdateClick = (obj) => {
    setFieldData((current) => {
      return { ...current, name: obj.name, mode: "edit", objId: obj.id };
    });
    addPopUp();
  };

  return (
    <>
      <div className="flex-right">
        <button onClick={() => addPopUp("add")} className="btn btn-primary">
          Add New Distributor
        </button>
        <button
          ref={distributorRef}
          data-bs-toggle="modal"
          data-bs-target="#distributorModal"
          style={{ display: "none" }}
        >
          Add New Distributor
        </button>
      </div>
      {loading ? (
        <LoaderDiv>
          <Loader size={50} />
        </LoaderDiv>
      ) : (
        <DistributorTable
          distributors={distributors}
          handleDistUpdateClick={handleDistUpdateClick}
        />
      )}
      <DistributorModal
        fieldData={fieldData}
        handleChange={handleFieldChange}
        handleSubmit={handleFormSubmit}
      />
    </>
  );
}

ListDistributor.propTypes = {};

export default ListDistributor;
