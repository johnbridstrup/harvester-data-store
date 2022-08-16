import { HoverDiv } from "../styled"


export const HarvesterHover = (props) => {
  return (
    <HoverDiv>
      <div><span>ID</span>: <span>{props.harvester.id}</span></div>
      <div><span>Harv ID</span>: <span>{props.harvester.harv_id}</span></div>
      <div><span>Name</span>: <span>{props.harvester.name}</span></div>
      <div><span>Fruit</span>: <span>{props.harvester.fruit}</span></div>
      <div><span>Location</span>: <span>{props.harvester.location}</span></div>
    </HoverDiv>
  )
}


export const LocationHover = (props) => {
  return (
    <HoverDiv>
      <div><span>ID</span>: <span>{props.location.id}</span></div>
      <div><span>Ranch</span>: <span>{props.location.ranch}</span></div>
      <div><span>Country</span>: <span>{props.location.country}</span></div>
      <div><span>Region</span>: <span>{props.location.region}</span></div>
      <div><span>Distributer</span>: <span>{props.location.distributor}</span></div>
    </HoverDiv>
  )
}

export const CodeHover = (props) => {
  return (
    <HoverDiv>
      {props.exceptions.map((excep, index) => (
        <ul key={index} className="list-group" style={{borderBottom: '1px solid #333'}}>
          <li>ID: {excep.code.id}</li>
          <li>Code: {excep.code.code}</li>
          <li>Name: {excep.code.name}</li>
          <li>Message: {excep.code.msg}</li>
          <li>Team: {excep.code.team}</li>
          <li>Cycle: {excep.code.cycle ? "True": "False"}</li>
        </ul>
      ))}
    </HoverDiv>
  )
}