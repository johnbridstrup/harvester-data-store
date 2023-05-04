import { useEffect, useReducer } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import ReactJson from "@microlink/react-json-view";
import moment from "moment";
import VSCodeEditor from "@monaco-editor/react";
import { JsonDiv, LoaderDiv, NavTabItem, NavTabs, NavTabSpan } from "../styled";
import { FULLFILLED_PROMISE, THEME_MODES } from "features/base/constants";
import { fullConfigReport } from "features/aftconfigs/aftconfigSlice";
import {
  getAftConfigKeys,
  Loader,
  monacoOptions,
  titleCase,
  transformConfig,
} from "utils/utils";

const initialState = {
  activetab: "release",
  configtab: "0",
  configsubtab: "overlay_diff",
  schema: null,
  configObj: null,
  fetching: false,
  subtabkeys: [],
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
      const { tab, subtab, obj, subtabkeys } = action.payload;
      return {
        ...state,
        configtab: tab,
        configsubtab: subtab,
        configObj: obj ? obj : state.configObj,
        subtabkeys: subtabkeys,
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
  const {
    configkeys,
    configreport,
    transformed: { configs, errored },
  } = useSelector((state) => state.aftconfig);
  const dispatch = useDispatch();
  const {
    harvester: { release, version, id },
  } = props;
  const {
    activetab,
    schema,
    configtab,
    configsubtab,
    configObj,
    fetching,
    subtabkeys,
  } = state;

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
          const { errored, obj } = transformConfig(res.payload.report?.data);
          const keys = getAftConfigKeys(obj);
          if (errored) {
            dispatchAction({
              type: "AFTCONFIG_KEY_TAB",
              payload: { tab: keys[0], obj: obj[keys[0]], subtabkeys: [] },
            });
          } else {
            const subkeys = getAftConfigKeys(obj[keys[0]]);
            dispatchAction({
              type: "AFTCONFIG_KEY_TAB",
              payload: { tab: keys[0], obj: undefined, subtabkeys: subkeys },
            });
            dispatchAction({
              type: "AFTCONFIG_SUB_TAB",
              payload: {
                tab: subkeys[0],
                obj: obj[keys[0]]?.[subkeys[0]],
              },
            });
          }
        }
        dispatchAction({
          type: "AFTCONFIG_FETCH",
          payload: false,
        });
      }
    } else if (category === "keytabs") {
      if (errored) {
        dispatchAction({
          type: "AFTCONFIG_KEY_TAB",
          payload: {
            tab,
            subtab: undefined,
            obj: configs[tab],
            subtabkeys: [],
          },
        });
      } else {
        const keys = getAftConfigKeys(configs[tab]);
        dispatchAction({
          type: "AFTCONFIG_KEY_TAB",
          payload: {
            tab,
            subtab: keys[0],
            obj: configs[tab]?.[keys[0]],
            subtabkeys: keys,
          },
        });
      }
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
          {subtabkeys.map((item, index) => (
            <NavTabItem key={index}>
              <NavTabSpan
                onClick={() => handleTabChange(item, "subtabs", undefined)}
                activetab={configsubtab}
                navto={item}
                theme={props.theme}
              >
                {titleCase(item, "_")}
              </NavTabSpan>
            </NavTabItem>
          ))}
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
              <Loader size={25} />
            </LoaderDiv>
          ) : (
            <>
              <div className="pt-2 pb-2">
                ReportTime: {moment(configreport.reportTime).format("LLLL")}
              </div>
              {errored ? (
                <VSCodeEditor
                  height="40vh"
                  language="python"
                  value={configObj}
                  theme={
                    props.theme === THEME_MODES.DARK_THEME ? "vs-dark" : "light"
                  }
                  options={{ ...monacoOptions, readOnly: true }}
                />
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
