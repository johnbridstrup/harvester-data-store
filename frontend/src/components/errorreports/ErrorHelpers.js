import { CodeServiceDiv, HoverDiv, ToolBox } from "../styled";
import PropTypes from "prop-types";

export const HarvesterHover = (props) => {
  return (
    <HoverDiv position={props.position}>
      <ToolBox position={props.position}>
        <div>
          <span>Harv ID</span>: <span>{props.harvester.harv_id}</span>
        </div>
        <div>
          <span>Name</span>: <span>{props.harvester.name}</span>
        </div>
        <div>
          <span>Fruit</span>: <span>{props.harvester.fruit.name}</span>
        </div>
        <div>
          <span>Location</span>: <span>{props.harvester.location.ranch}</span>
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
          <span>Ranch</span>: <span>{props.location.ranch}</span>
        </div>
        <div>
          <span>Country</span>: <span>{props.location.country}</span>
        </div>
        <div>
          <span>Region</span>: <span>{props.location.region}</span>
        </div>
        <div>
          <span>Distributer</span>:{" "}
          <span>{props.location.distributor.name}</span>
        </div>
      </ToolBox>
    </HoverDiv>
  );
};

export const CodeHover = (props) => {
  return (
    <HoverDiv position={props.position}>
      <ToolBox position={props.position}>
        {props.exceptions.map((excep, index) => (
          <CodeServiceDiv key={index}>
            <span>Code:{excep.code.code}</span>
            <span>Name: {excep.code.name}</span>
            <span>Message: {excep.code.msg}</span>
            <span>Team: {excep.code.team}</span>
            <span>Cycle: {excep.code.cycle ? "True" : "False"}</span>
          </CodeServiceDiv>
        ))}
      </ToolBox>
    </HoverDiv>
  );
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
