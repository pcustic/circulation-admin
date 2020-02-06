import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route, browserHistory } from "react-router";
import ContextProvider from "./components/ContextProvider";
import CatalogPage from "./components/CatalogPage";
import CustomListPage from "./components/CustomListPage";
import LanePage from "./components/LanePage";
import DashboardPage from "./components/DashboardPage";
import ConfigPage from "./components/ConfigPage";
import AccountPage from "./components/AccountPage";
import SetupPage from "./components/SetupPage";
import ManagePatrons from "./components/ManagePatrons";
import TroubleshootingPage from "./components/TroubleshootingPage";

interface ConfigurationSettings {
  /** A token generated by the server to prevent Cross-Site Request Forgery.
      The token should be included in an 'X-CSRF-Token' header in any non-GET
      requests. */
  csrfToken: string;

  /** `showCircEventsDownload` controls whether the dashboard will have an
      option to download a CSV of circulation events. This should be false if
      circulation events are not available for download. */
  showCircEventsDownload: boolean;

  /** `settingUp` will be true if this is a new circulation manager and the
      admin interface has never been used before. The interface will show a page
      for configuring admin authentication. The admin will need to set that up
      and log in before accessing the rest of the interface. */
  settingUp: boolean;

  /** `email` will be the email address of the currently logged in admin. */
  email?: string;

  /** `roles` contains the logged in admin's roles: system admininstrator,
      or library manager or librarian for one or more libraries. */
  roles?: {
    role: string;
    library?: string;
  }[];

  tos_link_text?: string;

  tos_link_href?: string;
}

/** The main admin interface application. Create an instance of this class
    to render the app and set up routing. */
class CirculationWeb {
  constructor(config: ConfigurationSettings) {
    let div = document.createElement("div");
    div.id = "opds-catalog";
    document.getElementsByTagName("body")[0].appendChild(div);

    let catalogEditorPath = "/admin/web(/collection/:collectionUrl)(/book/:bookUrl)(/tab/:tab)";
    let customListPagePath = "/admin/web/lists(/:library)(/:editOrCreate)(/:identifier)";
    let lanePagePath = "/admin/web/lanes(/:library)(/:editOrCreate)(/:identifier)";

    // `react-axe` should only run in development and testing mode.
    // Running this is resource intensive and should only be used to test
    // for accessibility and not during active development.
    if (process.env.TEST_AXE === "true") {
      let axe = require("react-axe");
      axe(React, ReactDOM, 1000);
    }

    if (config.settingUp) {
      ReactDOM.render(
        <ContextProvider {...config}>
          <SetupPage />
        </ContextProvider>,
        document.getElementById("opds-catalog")
      );
    } else {
      ReactDOM.render(
        <ContextProvider {...config}>
          <Router history={browserHistory}>
            <Route path={catalogEditorPath} component={CatalogPage} />
            <Route path={customListPagePath} component={CustomListPage} />
            <Route path={lanePagePath} component={LanePage} />
            <Route path="/admin/web/dashboard(/:library)" component={DashboardPage} />
            <Route path="/admin/web/config(/:tab)(/:editOrCreate)(/:identifier)" component={ConfigPage} />
            <Route path="/admin/web/account" component={AccountPage} />
            <Route path="/admin/web/patrons/:library(/:tab)" component={ManagePatrons} />
            <Route path="/admin/web/troubleshooting(/:tab)(/:subtab)" component={TroubleshootingPage} />
          </Router>
        </ContextProvider>,
        document.getElementById("opds-catalog")
      );
    }
  }
}

export = CirculationWeb;
