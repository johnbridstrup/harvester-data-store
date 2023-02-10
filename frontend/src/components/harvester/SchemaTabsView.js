import { useEffect, useReducer } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import ReactJson from "@microlink/react-json-view";
import { JsonDiv, LoaderDiv, NavTabItem, NavTabs, NavTabSpan } from "../styled";
import { FULLFILLED_PROMISE, THEME_MODES } from "features/base/constants";
import { fullConfigReport } from "features/aftconfigs/aftconfigSlice";
import { getAftConfigKeys, Loader } from "utils/utils";

const initialState = {
  activetab: "release",
  configtab: "0",
  configsubtab: "overlay_diff",
  schema: null,
  configObj: null,
  fetching: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "RELEASE_TAB":
      return { ...state, activetab: "release", schema: action.payload };
    case "VERSION_TAB":
      return { ...state, activetab: "version", schema: action.payload };
    case "AFTCONFIG_TAB":
      return { ...state, activetab: "aftconfig" };
    case "AFTCONFIG_KEY_TAB":
      const { tab, subtab, obj } = action.payload;
      return {
        ...state,
        configtab: tab,
        configsubtab: subtab,
        configObj: obj ? obj : state.configObj,
      };
    case "AFTCONFIG_SUB_TAB":
      return {
        ...state,
        configsubtab: action.payload.tab,
        configObj: action.payload.obj,
      };
    case "AFTCONFIG_FETCH":
      return {
        ...state,
        fetching: action.payload,
      };
    default:
      return state;
  }
}

function SchemaTabsView(props) {
  const [state, dispatchAction] = useReducer(reducer, initialState);
  const { configkeys, configs } = useSelector((state) => state.aftconfig);
  const dispatch = useDispatch();
  const {
    harvester: { release, version, id },
  } = props;
  const { activetab, schema, configtab, configsubtab, configObj, fetching } =
    state;

  const handleTabChange = async (tab, category, obj) => {
    if (category === "maintabs") {
      const dispatchObj = {
        release: "RELEASE_TAB",
        version: "VERSION_TAB",
        aftconfig: "AFTCONFIG_TAB",
      };
      dispatchAction({ type: dispatchObj[tab], payload: obj });
      if (tab === "aftconfig") {
        dispatchAction({
          type: "AFTCONFIG_FETCH",
          payload: true,
        });
        const res = await dispatch(fullConfigReport(id));
        if (res.type === FULLFILLED_PROMISE.aftconfig) {
          const report = res.payload.report?.data;
          const keys = getAftConfigKeys(report);
          dispatchAction({
            type: "AFTCONFIG_KEY_TAB",
            payload: { tab: keys[0], obj: undefined },
          });
          dispatchAction({
            type: "AFTCONFIG_SUB_TAB",
            payload: {
              tab: "overlay_diff",
              obj: report[keys[0]]?.["overlay_diff"],
            },
          });
        }
        dispatchAction({
          type: "AFTCONFIG_FETCH",
          payload: false,
        });
      }
    } else if (category === "keytabs") {
      dispatchAction({
        type: "AFTCONFIG_KEY_TAB",
        payload: {
          tab,
          subtab: "overlay_diff",
          obj: configs[tab]?.["overlay_diff"],
        },
      });
    } else if (category === "subtabs") {
      dispatchAction({
        type: "AFTCONFIG_SUB_TAB",
        payload: { tab, obj: configs[configtab]?.[tab] },
      });
    }
  };

  useEffect(() => {
    dispatchAction({ type: "RELEASE_TAB", payload: release });
  }, [release]);

  return (
    <div className="mb-4 mt-3">
      <NavTabs>
        <NavTabItem>
          <NavTabSpan
            onClick={() => handleTabChange("release", "maintabs", release)}
            activetab={activetab}
            navto={"release"}
            theme={props.theme}
          >
            Release
          </NavTabSpan>
        </NavTabItem>
        <NavTabItem>
          <NavTabSpan
            onClick={() => handleTabChange("version", "maintabs", version)}
            activetab={activetab}
            navto={"version"}
            theme={props.theme}
          >
            Version
          </NavTabSpan>
        </NavTabItem>
        <NavTabItem>
          <NavTabSpan
            onClick={() => handleTabChange("aftconfig", "maintabs", undefined)}
            activetab={activetab}
            navto={"aftconfig"}
            theme={props.theme}
          >
            AFTConfig
          </NavTabSpan>
        </NavTabItem>
      </NavTabs>
      {activetab === "aftconfig" && (
        <NavTabs>
          {configkeys.map((item, index) => (
            <NavTabItem key={index}>
              <NavTabSpan
                onClick={() => handleTabChange(item, "keytabs", undefined)}
                activetab={configtab}
                navto={item}
                theme={props.theme}
              >
                {item}
              </NavTabSpan>
            </NavTabItem>
          ))}
        </NavTabs>
      )}
      {activetab === "aftconfig" && configObj && (
        <NavTabs>
          <NavTabItem>
            <NavTabSpan
              onClick={() =>
                handleTabChange("overlay_diff", "subtabs", undefined)
              }
              activetab={configsubtab}
              navto={"overlay_diff"}
              theme={props.theme}
            >
              Applied Overlay Diff
            </NavTabSpan>
          </NavTabItem>
        </NavTabs>
      )}
      {(activetab === "release" || activetab === "version") && (
        <JsonDiv>
          <ReactJson
            src={schema ? schema : {}}
            collapsed={3}
            enableClipboard
            theme={
              props.theme === THEME_MODES.DARK_THEME ? "monokai" : "monokaii"
            }
          />
        </JsonDiv>
      )}
      {activetab === "aftconfig" && (
        <>
          {fetching ? (
            <LoaderDiv>
              <Loader size={50} />
            </LoaderDiv>
          ) : (
            <JsonDiv>
              <ReactJson
                src={configObj ? configObj : {}}
                collapsed={3}
                enableClipboard
                theme={
                  props.theme === THEME_MODES.DARK_THEME
                    ? "monokai"
                    : "monokaii"
                }
              />
            </JsonDiv>
          )}
        </>
      )}
    </div>
  );
}

SchemaTabsView.propTypes = {
  harvester: PropTypes.object.isRequired,
  theme: PropTypes.string,
};

export default SchemaTabsView;
