import styled, { css } from "styled-components";
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

export const HoverDiv = styled.div`
  position: absolute;
  width: 200px;
  margin-left: -100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  left: 50%;
  z-index: 10;
  bottom: calc(100% + 1px);

  ${({ position }) => {
    switch (position) {
      case "bottom":
        return css`
          bottom: unset !important;
          top: calc(100% + 1px);
        `;
      case "left":
        return css`
          margin-right: 0;
          width: 100%;
          left: unset;
          top: 50%;
          right: calc(100% + 1px);
          width: max-content;
        `;
      case "right":
        return css`
          margin-left: 0;
          width: 100%;
          top: 50%;
          left: calc(100% + 1px);
          width: max-content;
        `;
      default:
        return css`
          bottom: calc(100% + 1px);
        `;
    }
  }}
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

export const ToolBox = styled.div`
  position: relative;
  background-color: #fff;
  color: #000;
  text-align: center;
  border-radius: 5px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.2);
  background-clip: border-box;
  border: 1px solid rgba(0, 0, 0, 0.175);
  border: 1px solid rgba(0, 0, 0, 0.175);
  ${({ position }) => {
    switch (position) {
      case "right":
        return css`
          color: #000;
        `;
      default:
        return css``;
    }
  }}

  &:after {
    content: "";
    position: absolute;
    width: 5px;
    height: 5px;
    border-width: 5px;
    border-style: solid;
    border-color: #$fff transparent transparent transparent;
    left: calc(50% - 4.5px);
    top: 100%;
  }
  ${({ position }) => {
    switch (position) {
      case "bottom":
        return css`
          &:after {
            border-color: transparent transparent #fff transparent;
            top: unset;
            width: 1px;
            bottom: 100%;
            left: calc(50% - 5px);
          }
        `;
      case "left":
        return css`
          &:after {
            border-color: transparent transparent transparent #fff;
            left: 100%;
            top: calc(50% - 5px);
          }
        `;
      case "right":
        return css`
          &:after {
            border-color: transparent #fff transparent transparent;
            right: 100%;
            left: unset;
            top: calc(50% - 5px);
          }
        `;
      case "top":
        return css`
          &:after {
            border-color: #fff transparent transparent transparent;
            bottom: unset;
            width: 1px;
            top: 100%;
            right: calc(50% - 5px);
          }
        `;
      default:
        return css``;
    }
  }}
`;

export const CodeServiceDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 0.2rem;
  border-bottom: 1px solid #333;
`;

export const HoverDivModal = styled.div`
  position: absolute;
  left: 50%;
  width: 200px;
  height: 100px;
  overflow-y: scroll;
  transform: translateX(-50%);
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  min-width: 0;
  word-wrap: break-word;
  background-color: #fff;
  z-index: 10;
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
