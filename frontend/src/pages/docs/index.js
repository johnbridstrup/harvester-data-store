import VSCodeEditor from "@monaco-editor/react";
import { useSelector } from "react-redux";
import { THEME_MODES } from "features/base/constants";
import { monacoOptions } from "utils/utils";
import { BackButton } from "components/common";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import useOpenApi from "hooks/useOpenApi";
import "./styles.css";

function DocumentationView(props) {
  const { token } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.home);
  const { schema, loading } = useOpenApi(token);

  const query = `
  # filter errorreport with harvester with harv_id 11
  ErrorReport.objects.filter(harvester__harv_id=11)

  # filter errorreport with harvester at ranch B
  ErrorReport.objects.filter(location__ranch='Ranch B')

  #filter error report with both harv_id 11 and ranch B
  ErrorReport.objects.filter(harvester__harv_id=11,location__ranch='Ranch B')

  # update filter to include code 9
  ErrorReport.objects.filter(
    harvester__harv_id=11,
    location__ranch='Ranch B',
    exceptions__code__code=9
  )

  # update filter to include fruit strawberry
  ErrorReport.objects.filter(
    harvester__harv_id=11,
    location__ranch='Ranch B',
    exceptions__code__code=9,
    harvester__fruit__name='strawberry'
  )
  `;

  return (
    <MainLayout>
      <div className="container">
        <Header title={"HDS Documentation"} className={"display-6 mt-4 mb-4"} />
        <BackButton mb="mb-4" theme={theme} />
        <div className="mb-4">
          This page provides the documentation about the django models that
          builds up HDS. From the model's structure it eases up the ability to
          construct generic field lookup on django model for the error report
          query page. Click{" "}
          <a
            href="https://docs.djangoproject.com/en/4.1/ref/models/lookups/"
            target="_blank"
            rel="noreferrer"
          >
            here
          </a>{" "}
          For more info on django lookup expression{" "}
        </div>
        <div className="row">
          <div className="col-md-6">
            <div>HDS ErrorReport Related Models</div>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <VSCodeEditor
                height="80vh"
                language="json"
                value={JSON.stringify(schema?.ErrorReportDetail, null, "\t")}
                theme={theme === THEME_MODES.DARK_THEME ? "vs-dark" : "light"}
                options={{ ...monacoOptions, readOnly: true }}
              />
            )}
          </div>
          <div className="col-md-6">
            <div>Example Query</div>
            <VSCodeEditor
              height="80vh"
              language="python"
              value={query}
              theme={theme === THEME_MODES.DARK_THEME ? "vs-dark" : "light"}
              options={{ ...monacoOptions, readOnly: true }}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

DocumentationView.propTypes = {};

export default DocumentationView;
