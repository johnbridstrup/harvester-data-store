import styled from "styled-components";
import { Link } from "react-router-dom";

export const SpanLimit = styled.span`
  margin-left: 2rem;
  margin-right: 1rem;
  color: #6c757d;
`;

export const InputLimit = styled.input`
  width: 25%;
  padding: 0.375rem 0.75rem;
  color: #6c757d;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
`;

export const PageItem = styled.li`
  display: flex;
  align-items: center;
`;

export const Container = styled.div`
  margin-top: 3rem;
  margin-bottom: 1rem;
`;

export const LoaderDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 25vh;
`;

export const RouteLoader = styled(LoaderDiv)`
  height: 100vh;
`;

export const Table = styled.table``;

export const DivTotalReport = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  & span {
    font-size: 1.6rem;
    margin-right: 0.5rem;
  }
`;

export const InputFormControl = styled.input`
  display: block;
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #212529;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border-radius: 0.375rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const ClipboardDiv = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.5rem;
`;

export const NavTabs = styled.ul`
  display: flex;
  flex-wrap: wrap;
  padding-left: 0;
  margin-top: 0;
  margin-bottom: 0;
  list-style: none;
  border-bottom: 1px solid #dee2e6;
`;

export const NavTabItem = styled.li`
  margin-bottom: -1px;
`;

export const NavTabLink = styled(Link)`
  border: 1px solid transparent;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  display: block;
  padding: 0.5rem 1rem;
  text-decoration: none;

  color: ${(props) =>
    props.activetab === props.navto ? "#495057" : "rgba(0,0,0,.5)"};
  background-color: ${(props) =>
    props.activetab === props.navto ? "#fff" : ""};
  border-color: ${(props) =>
    props.activetab === props.navto ? "#dee2e6 #dee2e6 #fff" : ""};

  &:hover {
    color: #495057;
    background-color: #fff;
    border-color: #dee2e6 #dee2e6 #fff;
  }
`;

export const TabContent = styled.div`
  display: flex;
  flex-direction: column;
`;

export const NavTabSpan = styled.span`
  border: 1px solid transparent;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  display: block;
  padding: 0.5rem 1rem;
  text-decoration: none;
  cursor: pointer;

  color: ${(props) =>
    props.activetab === props.navto ? "#495057" : "rgba(0,0,0,.5)"};
  background-color: ${(props) =>
    props.activetab === props.navto
      ? props.activetab === props.robocolor
        ? "#FF7276"
        : "#fff"
      : ""};
  border-color: ${(props) =>
    props.activetab === props.navto ? "#dee2e6 #dee2e6 #fff" : ""};

  &:hover {
    color: #495057;
    background-color: #fff;
    border-color: #dee2e6 #dee2e6 #fff;
  }
`;

export const JsonDiv = styled.div`
  width: 100%;
  height: 400px;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow-y: scroll;
`;

export const Td = styled.td`
  position: relative;
`;

export const SpanTarget = styled.span`
  border: none;
  background: inherit;
  padding: 1px;
  margin: -1px;
  font-size: inherit;
  color: inherit;
  cursor: inherit;
  display: flex;
`;

export const NavMainTabSpan = styled(NavTabSpan)`
  color: ${(props) =>
    props.activetab === props.navto ? "#495057" : "rgba(0,0,0,.5)"};
  background-color: ${(props) => (props.errored === true ? "#FF7276" : "")};
  border-color: ${(props) =>
    props.activetab === props.navto ? "#dee2e6 #dee2e6 #fff" : ""};

  &:hover {
    color: #495057;
    background-color: #fff;
    border-color: #dee2e6 #dee2e6 #fff;
  }
`;

export const SidePane = styled.div`
  position: relative;
  width: ${(props) => (props.open === true ? "380px" : "0")};
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  transition: 0.5s;
`;

export const Accordion = styled.div`
  position: relative;
  height: ${(props) => (props.obj.id === props.host.id ? "200px" : "0")};
  transition: 0.5s;
  margin-bottom: 10px;
`;
