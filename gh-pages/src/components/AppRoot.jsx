import React from "react";
import { Route, Redirect, Switch } from "react-router-dom";
import EmittingDataSource from "data-chains/src/EmittingDataSource.js";

import Map from "./Map.jsx";
import Docs from "./Docs.jsx";
import Footer from "./Footer.jsx";
import NavBar from "./NavBar.jsx";
import Alerts from "./Alerts.jsx";
import Measure from "react-measure";

const AppRoot = class AppRoot extends React.Component {
  constructor(props) {
    super(props);

    this.state = { alerts: [] };
    // This line is important!
    this.setNavHeight = this.setNavHeight.bind(this);
    this.removeAlert = this.removeAlert.bind(this);
    this.addAlert = this.addAlert.bind(this);
  }

  setNavHeight(navbarHeight) {
    this.setState({
      navbarHeight: navbarHeight
    });
  }

  removeAlert(index) {
    let alerts = this.state.alerts;
    alerts.splice(index, 1);
    this.setState({ alerts: alerts });
  }

  addAlert(alert) {
    let alerts = this.state.alerts;
    alerts.push(alert);
    this.setState({ alerts: alerts });
  }

  render() {
    return (
      <div className="container">
        <Measure onMeasure={dimensions => this.setNavHeight(dimensions.height)}>
          <div
            style={{
              marginBottom: 20 + "px",
              zIndex: 300,
              position: "relative"
            }}>
            <NavBar
              setNavHeight={this.setNavHeight}
              location={this.props.location}
            />
            {this.state.alerts.length > 0 && (
              <Alerts
                removeAlert={this.removeAlert}
                alerts={this.state.alerts}
              />
            )}
          </div>
        </Measure>
        <Switch>
          <Route
            path="/home"
            render={routeProps => (
              <Map
                addAlert={this.addAlert}
                dataLink={new EmittingDataSource()}
                {...routeProps}
              />
            )}
          />
          <Route path="/docs" render={routeProps => <Docs {...routeProps} />} />
          <Redirect from="*" to="/home" />
        </Switch>
        <Footer />
      </div>
    );
  }
};

export default AppRoot;
