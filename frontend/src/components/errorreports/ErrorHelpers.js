import { CodeServiceDiv, HoverDiv, HoverDivModal, ToolBox } from "../styled";
import PropTypes from "prop-types";
import { getUniqueListBy } from "../../utils/utils";

export const ParetoTabular = (props) => {
  return (
    <div>
      <div className="d-flex">
        <div className="tabular bg-gray">Property</div>
        <div className="tabular bg-gray">Value</div>
      </div>
      {props.paramsObj?.harv_ids && (
        <div className="d-flex">
          <div className="tabular">harv_ids</div>
          <div className="tabular">{props.paramsObj.harv_ids}</div>
        </div>
      )}
      {props.paramsObj?.locations && (
        <div className="d-flex">
          <div className="tabular">locations</div>
          <div className="tabular">{props.paramsObj.locations}</div>
        </div>
      )}
      {props.paramsObj?.fruits && (
        <div className="d-flex">
          <div className="tabular">fruits</div>
          <div className="tabular">{props.paramsObj.fruits}</div>
        </div>
      )}
      {props.paramsObj?.codes && (
        <div className="d-flex">
          <div className="tabular">codes</div>
          <div className="tabular">{props.paramsObj.codes}</div>
        </div>
      )}
      {props.paramsObj?.traceback && (
        <div className="d-flex">
          <div className="tabular">traceback</div>
          <div className="tabular">{props.paramsObj.traceback}</div>
        </div>
      )}
      {props.paramsObj?.tz && (
        <div className="d-flex">
          <div className="tabular">Timezone</div>
          <div className="tabular">{props.paramsObj.tz}</div>
        </div>
      )}
      {props.paramsObj?.start_time && (
        <div className="d-flex">
          <div className="tabular">start_time</div>
          <div className="tabular">{props.paramsObj.start_time}</div>
        </div>
      )}
      {props.paramsObj?.end_time && (
        <div className="d-flex">
          <div className="tabular">end_time</div>
          <div className="tabular">{props.paramsObj.end_time}</div>
        </div>
      )}
    </div>
  );
};

export const BackButton = () => {
  const goBack = () => window.history.back();
  return (
    <div className="mt-4 mb-4">
      <span className="btn btn-default" onClick={goBack}>
        <i className="las la-arrow-left"></i> Back
      </span>
    </div>
  );
};

export const HarvesterHover = (props) => {
  return (
    <HoverDiv position={props.position}>
      <ToolBox position={props.position}>
        <div>
          <span>Harv ID</span>:{" "}
          <span>
            <strong>{props.harvester.harv_id}</strong>
          </span>
        </div>
        <div>
          <span>Name</span>:{" "}
          <span>
            <strong>{props.harvester.name}</strong>
          </span>
        </div>
        <div>
          <span>Fruit</span>:{" "}
          <span>
            <strong>{props.harvester.fruit.name}</strong>
          </span>
        </div>
        <div>
          <span>Location</span>:{" "}
          <span>
            <strong>{props.harvester.location.ranch}</strong>
          </span>
        </div>
      </ToolBox>
    </HoverDiv>
  );
};

export const LocationHover = (props) => {
  return (
    <HoverDiv position={props.position}>
      <ToolBox position={props.position}>
        <div>
          <span>Ranch</span>:{" "}
          <span>
            <strong>{props.location.ranch}</strong>
          </span>
        </div>
        <div>
          <span>Country</span>:{" "}
          <span>
            <strong>{props.location.country}</strong>
          </span>
        </div>
        <div>
          <span>Region</span>:{" "}
          <span>
            <strong>{props.location.region}</strong>
          </span>
        </div>
        <div>
          <span>Distributer</span>:{" "}
          <span>
            <strong>{props.location.distributor.name}</strong>
          </span>
        </div>
      </ToolBox>
    </HoverDiv>
  );
};

export const CodeHover = (props) => {
  const exceptions = getUniqueListBy(props.exceptions, "code");
  return (
    <HoverDivModal position={props.position}>
      <ToolBox position={props.position}>
        {exceptions.map((excep, index) => (
          <CodeServiceDiv key={index}>
            <span>
              Code: <strong>{excep.code.code}</strong>
            </span>
            <span>
              Name: <strong>{excep.code.name}</strong>
            </span>
            <span>
              Message: <strong>{excep.code.msg}</strong>
            </span>
            <span>
              Team: <strong>{excep.code.team}</strong>
            </span>
            <span>
              Cycle: <strong>{excep.code.cycle ? "True" : "False"}</strong>
            </span>
          </CodeServiceDiv>
        ))}
      </ToolBox>
    </HoverDivModal>
  );
};

ParetoTabular.propTypes = {
  paramsObj: PropTypes.object,
};

HarvesterHover.propTypes = {
  harvester: PropTypes.object,
  position: PropTypes.string,
};

LocationHover.propTypes = {
  location: PropTypes.object,
  position: PropTypes.string,
};

CodeHover.propTypes = {
  exceptions: PropTypes.array,
  position: PropTypes.string,
};
