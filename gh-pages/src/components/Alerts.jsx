import React from "react"; // eslint-disable-line no-unused-vars

/**
 * Create a React component for displaying alerts
 */
const Alerts = class Alerts extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let alerts = [];
    for (let i = 0; i < this.props.alerts.length; i++) {
      alerts.push(
        <div
          key={i}
          className={"alert alert-" + this.props.alerts[i].type}
          role="alert">
          <button
            type="button"
            className="close"
            onClick={() => {
              this.props.removeAlert(i);
            }}
            aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
          {this.props.alerts[i].text}
        </div>
      );
    }
    return <div style={{ zIndex: 300 }}>{alerts}</div>;
  }
};

export default Alerts;
