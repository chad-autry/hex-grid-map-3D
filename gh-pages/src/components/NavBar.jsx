import React from "react";

import NavItem from "./NavItem.jsx";

/**
 * Create a React component for the NavBar
 * The only state it contains is if it is collapsed or not
 * It is passed in authentication, and route state for display
 */
export default class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { menuCollapsed: true };
    // This line is important!
    this.menuClicked = this.menuClicked.bind(this);
  }

  menuClicked() {
    this.setState({
      menuCollapsed: !this.state.menuCollapsed
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Don't blow the stack out by re-rendering when this components height is set to the parent
    return (
      this.state.menuCollapsed != nextState.menuCollapsed ||
      this.props.location.pathname != nextProps.location.pathname
    );
  }

  render() {
    return (
      <div className="navbar navbar-default" style={{ zIndex: 300 }}>
        <div className="navbar-header" onClick={this.menuClicked}>
          <div className="navbar-toggle">
            <span className="sr-only">Toggle navigation</span>
            <i
              className={
                this.state.menuCollapsed
                  ? "fa fa-chevron-right"
                  : "fa fa-chevron-down"
              }
            />
          </div>
          <div className="navbar-brand">
            <i className="fa fa-map-o" /> hex-grid-map-3D
          </div>
        </div>
        {/*Programatically controll hiding the collapse using react.
                    Due to hdpi devices, we're collapsible on both on both xs and sm screens */}
        <div
          className={
            this.state.menuCollapsed
              ? "navbar-collapse hidden-xs hidden-sm"
              : "navbar-collapse"
          }>
          <ul className="nav navbar-nav">
            <NavItem to="/home" location={this.props.location}>
              <i className="fa fa-home" /> Home
            </NavItem>
            <NavItem to="/docs" location={this.props.location}>
              <i className="fa fa-book" /> Docs
            </NavItem>
            <li>
              <a href="https://github.com/chad-autry/hex-grid-map-3D">
                <i className="fa fa-github-alt" /> Github
              </a>
            </li>
            <li>
              <a href="https://github.com/chad-autry/hex-grid-map-3D/issues">
                <i className="fa fa-comments" /> Support
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}
