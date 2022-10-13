import { useEffect, useReducer } from "react";
import PropTypes from "prop-types";
import ReactJson from "@microlink/react-json-view";
import { Container, JsonDiv, NavTabItem, NavTabs, NavTabSpan } from "../styled";

const initialState = {
  activetab: "release",
  schema: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "RELEASE_TAB":
      return { activetab: "release", schema: action.payload };
    case "VERSION_TAB":
      return { activetab: "version", schema: action.payload };
    default:
      return state;
  }
}

function SchemaTabsView(props) {
  const [state, dispatchAction] = useReducer(reducer, initialState);
  const { release, version } = props.harvester;
  const { activetab, schema } = state;

  const handleTabChange = (tab, obj) => {
    const dispatchObj = {
      release: "RELEASE_TAB",
      version: "VERSION_TAB",
    };
    dispatchAction({ type: dispatchObj[tab], payload: obj });
  };

  useEffect(() => {
    dispatchAction({ type: "RELEASE_TAB", payload: release });
  }, [release]);

  return (
    <div className="mb-4">
      <Container>
        <NavTabs>
          <NavTabItem>
            <NavTabSpan
              onClick={() => handleTabChange("release", release)}
              activetab={activetab}
              navto={"release"}
            >
              Release
            </NavTabSpan>
          </NavTabItem>
          <NavTabItem>
            <NavTabSpan
              onClick={() => handleTabChange("version", version)}
              activetab={activetab}
              navto={"version"}
            >
              Version
            </NavTabSpan>
          </NavTabItem>
        </NavTabs>
      </Container>
      <JsonDiv>
        <ReactJson src={schema ? schema : {}} collapsed={3} enableClipboard />
      </JsonDiv>
    </div>
  );
}

SchemaTabsView.propTypes = {
  harvester: PropTypes.object.isRequired,
};

export default SchemaTabsView;
