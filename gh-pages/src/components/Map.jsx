import HexBoard from "../../../src/HexBoard.js";
import React from "react"; // eslint-disable-line no-unused-vars
import ReactDom from "react-dom"; // eslint-disable-line no-unused-vars
import HexDefinition from "cartesian-hexagonal";
import GridContext from "../../../src/contexts/InverseGridContext.js";
import CameraControllingMouseListener from "../../../src/listeners/CameraControlingMouseListener.js";

/**
 * Factory function, returns a React component given the required params
 * Injecting all dependencies (instead of just using require) since some modules are dynamically loaded
 * And require does not give duplicate objects
 * @param React - React, used to declare the class
 * @param ScenarioService - The scenario service used to for all actions
 */
const Map = class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = { mode: "pan" };
    // This line is important!
    this.setComponentState = this.setComponentState.bind(this);
    this.setMode = this.setMode.bind(this);
    this.baseDataLink = props.dataLink;
  }

  render() {
    return (
      <div>
        <canvas
          ref={canvasRef => (this.canvasRef = canvasRef)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            backgroundColor: "green",
            width: "100%",
            height: "100%",
            zIndex: 200
          }}
        />
        <div
          className="btn-group-vertical"
          style={{
            zIndex: 300
          }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              this.setMode("pan");
            }}>
            Pan
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              this.setMode("tilt");
            }}>
            Tilt
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              this.setMode("spin");
            }}>
            Spin
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              this.setMode("zoom");
            }}>
            Zoom
          </button>
        </div>
      </div>
    );
  }

  resizeCanvas(canvas) {
    // Lookup the size the browser is displaying the canvas.
    let displayWidth = canvas.clientWidth;
    let displayHeight = canvas.clientHeight;
    let ctx = canvas.getContext("webgl");
    let dpr = window.devicePixelRatio || 1;
    let bsr =
      ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio ||
      1;

    let ratio = dpr / bsr;

    //Now make the canvas draw at the display size multiplied by the ratio
    canvas.width = displayWidth * ratio;
    canvas.height = displayHeight * ratio;
  }

  setMode(mode) {
    this.setState({
      mode: mode
    });
    this.cameraControllingMouseListener.setMode(mode);
  }

  componentDidMount() {
    this.resizeCanvas(this.canvasRef);
    let resizeFunction = () => {
      this.resizeCanvas(this.canvasRef);
      //    this.hexBoard.engine.setSize(this.canvasRef.width, this.canvasRef.height);
    };
    this.resizeListener = resizeFunction;
    window.addEventListener("resize", this.resizeListener);
    //babylon.js is controlling the size, force it to resize using our container size when opened
    //            this.props.glContainer.on('open', resizeFunction);

    //babylon.js is controlling the size, force it to resize using our container size on golden-layout resize
    //           this.props.glContainer.on('resize', resizeFunction);

    this.hexBoard = new HexBoard(this.canvasRef, window, "#000000");
    let hexDimensions = new HexDefinition(55, 1, 0, 3);
    this.hexBoard.setHexDimensions(hexDimensions);
    this.gridContext = new GridContext(hexDimensions, this.hexBoard, "#808080");
    this.cameraControllingMouseListener = new CameraControllingMouseListener(
      this.hexBoard
    );
    this.hexBoard.init();
  }

  componentWillUnmount() {
    //            this.props.glEventHub.off( 'map-state-changed', this.setComponentState );
    window.removeEventListener("resize", this.resizeListener);
  }

  setComponentState(mapState) {
    this.baseDataLink.addItems(mapState);
  }

  componentWillUpdate(nextProps, nextState) {
    // When a new state comes in, update the map component's baseDataLink
    if (nextState) {
      this.baseDataLink.addItems(nextState);
    }
  }
};

export default Map;
