import HexBoard from "../../../src/HexBoard.js";
import React from "react"; // eslint-disable-line no-unused-vars
import ReactDom from "react-dom"; // eslint-disable-line no-unused-vars
import HexDefinition from "cartesian-hexagonal";
import GridContext from "../../../src/contexts/InverseGridContext.js";
import StarryContext from "../../../src/contexts/StarryContext.js";
import CameraControllingMouseListener from "../../../src/listeners/CameraControlingMouseListener.js";
import EmittingDataSource from "data-chains/src/EmittingDataSource.js";
import SphereMeshFactory from "../../../src/meshFactories/SphereMeshFactory";
import ArrowMeshFactory from "../../../src/meshFactories/ArrowMeshFactory";
import ItemMappingPipelineNode from "../../../src/pipeline/ItemMappingPipelineNode";
import PlanarPositioningPipelineNode from "../../../src/pipeline/PlanarPositioningPipelineNode";
import ZStackingPipelineNode from "../../../src/pipeline/ZStackingPipelineNode";
import FieldOfSquaresMeshFactory from "../../../src/meshFactories/FieldOfSquaresMeshFactory";
import RegularPolygonMeshFactory from "../../../src/meshFactories/RegularPolygonMeshFactory";
//import UpdateableVectorMeshFactory from "../../../src/meshFactories/UpdateableVectorMeshFactory";
import ImageMeshFactory from "../../../src/meshFactories/ImageMeshFactory";
import TwoDVectorMeshFactory from "../../../src/meshFactories/TwoDVectorMeshFactory";
import VectorDecoratingPipelineNode from "../../../src/pipeline/VectorDecoratingPipelineNode";
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
    this.setMode = this.setMode.bind(this);
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
    // Mess with sizing the canvas
    this.resizeCanvas(this.canvasRef);
    let resizeFunction = () => {
      this.resizeCanvas(this.canvasRef);
      //    this.hexBoard.engine.setSize(this.canvasRef.width, this.canvasRef.height);
    };
    this.resizeListener = resizeFunction;
    window.addEventListener("resize", this.resizeListener);

    //Make the HexBoard which wraps Babylon.js instantiation and mouse handleing
    this.hexBoard = new HexBoard(this.canvasRef, window, "#000000");
    //The pixel dimensions, and cartesion/hexagonal coordinate helper
    let hexDimensions = new HexDefinition(55, 1, 0, 3);
    this.hexBoard.setHexDimensions(hexDimensions);

    //Setup a new grid context to draw and manage a hexagonal grid
    //It'll control transforming the grid as the camera focus changes position
    this.gridContext = new GridContext(
      hexDimensions,
      this.hexBoard,
      "#808080",
      15,
      15,
      0.5
    );

    //Setup a starry field context
    this.starryContext = new StarryContext(hexDimensions, this.hexBoard, 2000);

    // Next we need a way to draw the rest of the scene.
    // We could manage each item individually, but lets set up a transformation pipeline like a game would

    //An emitting datasource lets us add (or modifiy or remove) items, which can then be reacted to by listeners
    let pipelineStart = new EmittingDataSource();

    // Next up make the drawn item factories
    let sphereMeshFactory = new SphereMeshFactory(hexDimensions);
    let arrowMeshFactory = new ArrowMeshFactory(hexDimensions);
    let imageMeshFactory = new ImageMeshFactory(hexDimensions);
    let twoDVectorMeshFactory = new TwoDVectorMeshFactory(hexDimensions);
    let regularPolygonMeshFactory = new RegularPolygonMeshFactory(
      hexDimensions
    );
    let fieldOfSquaresMeshFactory = new FieldOfSquaresMeshFactory(
      hexDimensions,
      9,
      20,
      ["#8d8468", "#86775f", "#7a6a4f", "#7f7053"]
    );

    // And then add a pipeline node to use the appropriate factory for each business object
    let itemMap = {};
    itemMap.arrow = (item, scene) => {
      return arrowMeshFactory.getMesh(item, scene);
    };
    itemMap.asteroids = (item, scene) => {
      return fieldOfSquaresMeshFactory.getMesh(item, scene);
    };
    itemMap.ship = (item, scene) => {
      return imageMeshFactory.getMesh(item, scene);
    };
    itemMap.polygon = (item, scene) => {
      // YOu could map ships or space stations or something game related to specific polygons
      return regularPolygonMeshFactory.getMesh(item, scene);
    };
    itemMap.vector = (item, scene) => {
      return twoDVectorMeshFactory.getMesh(item, scene);
    };
    itemMap.planet = itemMap.moon = itemMap.star = (item, scene) => {
      // Proxy the more basic sphereMeshFactory getMesh function, with various hard coded things our DTO won't have
      let getMeshParams = {
        size: item.size,
        lineWidth: item.lineWidth,
        greatCircleAngles: [0, Math.PI / 3, -Math.PI / 3],
        latitudeAngles: [
          0,
          Math.PI / 6,
          Math.PI / 3,
          -Math.PI / 6,
          -Math.PI / 3
        ],
        lineColor: item.lineColor,
        backgroundColor: item.backgroundColor
      };
      if (item.type === "star") {
        getMeshParams.borderStar = {
          radius1: 3,
          radius2: 6,
          points: 20,
          borderColor: item.lineColor
        };
      } else {
        getMeshParams.borderWidth = 2;
        getMeshParams.borderColor = item.borderColor;
      }
      let mesh = sphereMeshFactory.getMesh(getMeshParams, scene);
      mesh.data.item = item;
      return mesh;
    };
    let itemMappingPipelineNode = ItemMappingPipelineNode(
      itemMap,
      this.hexBoard.scene
    );
    itemMappingPipelineNode.setDataSource(pipelineStart);

    // Next a pipeline node to reposition the item based on object's hex coordinate
    let planarPositioningPipelineNode = new PlanarPositioningPipelineNode(
      hexDimensions
    );
    planarPositioningPipelineNode.setDataSource(itemMappingPipelineNode);

    // Next translate it up or down to stack items within the same cell
    let zStackingPipelineNode = new ZStackingPipelineNode(10);
    zStackingPipelineNode.setDataSource(planarPositioningPipelineNode);

    let vectorDecoratingPipelineNode = new VectorDecoratingPipelineNode(
      twoDVectorMeshFactory,
      this.hexBoard.scene
    );
    vectorDecoratingPipelineNode.setDataSource(zStackingPipelineNode);
    //Setup a camera controlling mouse listener, buttons we set up hook into the different modes
    this.cameraControllingMouseListener = new CameraControllingMouseListener(
      this.hexBoard
    );

    this.hexBoard.addListener("mouseUp", e => {
      if (!e.clickedItem && !e.mouseMoved) {
        let hexagonalCoordinates = hexDimensions.getReferencePoint(
          e.mapX,
          e.mapY
        );

        this.props.addAlert({
          type: "info",
          text:
            "Clicked U:" +
            hexagonalCoordinates.u +
            " V:" +
            hexagonalCoordinates.v
        });
      }
    });

    // Add our items to the base datasource. Game logic or a server fetch would do this

    // Add the sun
    pipelineStart.addItems([
      {
        id: "sun",
        type: "star",
        size: 100,
        lineWidth: 5,
        lineColor: "#f97306",
        backgroundColor: "#ffff14",
        u: 0,
        v: 0
      }
    ]);

    //Add the earth
    pipelineStart.addItems([
      {
        id: "earth",
        type: "planet",
        size: 66,
        lineWidth: 5,
        lineColor: "#653700",
        backgroundColor: "#0343df",
        borderColor: "#ffffff",
        u: 5,
        v: 5
      }
    ]);

    //Add the moon
    pipelineStart.addItems([
      {
        id: "moon",
        type: "moon",
        size: 33,
        lineWidth: 2.5,
        lineColor: "#929591",
        backgroundColor: "#e1e1d6",
        borderWidth: 3,
        borderColor: "black",
        u: 3,
        v: 8
      }
    ]);

    //Add arrows to represent gravity
    //Gravity around the sun
    pipelineStart.addItems([
      {
        id: "sa1",
        type: "arrow",
        u: 0,
        v: -1,
        fillColor: "#929591",
        lineWidth: 3,
        lineColor: "#929591",
        rotation: 180,
        scaleLength: 0.75,
        scaleWidth: 0.75
      }
    ]);
    pipelineStart.addItems([
      {
        id: "sa2",
        type: "arrow",
        u: -1,
        v: 0,
        fillColor: "#929591",
        lineWidth: 3,
        lineColor: "#929591",
        rotation: 240,
        scaleLength: 0.75,
        scaleWidth: 0.75
      }
    ]);
    pipelineStart.addItems([
      {
        id: "sa3",
        type: "arrow",
        u: -1,
        v: 1,
        fillColor: "#929591",
        lineWidth: 3,
        lineColor: "#929591",
        rotation: 300,
        scaleLength: 0.75,
        scaleWidth: 0.75
      }
    ]);
    pipelineStart.addItems([
      {
        id: "sa4",
        type: "arrow",
        u: 0,
        v: 1,
        fillColor: "#929591",
        lineWidth: 3,
        lineColor: "#929591",
        rotation: 0,
        scaleLength: 0.75,
        scaleWidth: 0.75
      }
    ]);
    pipelineStart.addItems([
      {
        id: "sa5",
        type: "arrow",
        u: 1,
        v: 0,
        fillColor: "#929591",
        lineWidth: 3,
        lineColor: "#929591",
        rotation: 60,
        scaleLength: 0.75,
        scaleWidth: 0.75
      }
    ]);
    pipelineStart.addItems([
      {
        id: "sa6",
        type: "arrow",
        u: 1,
        v: -1,
        fillColor: "#929591",
        lineWidth: 3,
        lineColor: "#929591",
        rotation: 120,
        scaleLength: 0.75,
        scaleWidth: 0.75
      }
    ]);

    //gravity around the planet
    pipelineStart.addItems([
      {
        id: "ea1",
        type: "arrow",
        u: 5,
        v: 4,
        fillColor: "#929591",
        lineWidth: 3,
        lineColor: "#929591",
        rotation: 180,
        scaleLength: 0.75,
        scaleWidth: 0.75
      }
    ]);
    pipelineStart.addItems([
      {
        id: "ea2",
        type: "arrow",
        u: 4,
        v: 5,
        fillColor: "#929591",
        lineWidth: 3,
        lineColor: "#929591",
        rotation: 240,
        scaleLength: 0.75,
        scaleWidth: 0.75
      }
    ]);
    pipelineStart.addItems([
      {
        id: "ea3",
        type: "arrow",
        u: 4,
        v: 6,
        fillColor: "#929591",
        lineWidth: 3,
        lineColor: "#929591",
        rotation: 300,
        scaleLength: 0.75,
        scaleWidth: 0.75
      }
    ]);
    pipelineStart.addItems([
      {
        id: "ea4",
        type: "arrow",
        u: 5,
        v: 6,
        fillColor: "#929591",
        lineWidth: 3,
        lineColor: "#929591",
        rotation: 0,
        scaleLength: 0.75,
        scaleWidth: 0.75
      }
    ]);
    pipelineStart.addItems([
      {
        id: "ea5",
        type: "arrow",
        u: 6,
        v: 5,
        fillColor: "#929591",
        lineWidth: 3,
        lineColor: "#929591",
        rotation: 60,
        scaleLength: 0.75,
        scaleWidth: 0.75
      }
    ]);
    pipelineStart.addItems([
      {
        id: "ea6",
        type: "arrow",
        u: 6,
        v: 4,
        fillColor: "#929591",
        lineWidth: 3,
        lineColor: "#929591",
        rotation: 120,
        scaleLength: 0.75,
        scaleWidth: 0.75
      }
    ]);

    //unfilled gravity around the moon
    pipelineStart.addItems([
      {
        id: "ma1",
        type: "arrow",
        u: 3,
        v: 7,
        lineWidth: 3,
        lineColor: "#929591",
        rotation: 180,
        scaleLength: 0.75,
        scaleWidth: 0.75
      }
    ]);
    pipelineStart.addItems([
      {
        id: "ma2",
        type: "arrow",
        u: 2,
        v: 8,
        lineWidth: 3,
        lineColor: "#929591",
        rotation: 240,
        scaleLength: 0.75,
        scaleWidth: 0.75
      }
    ]);
    pipelineStart.addItems([
      {
        id: "ma3",
        type: "arrow",
        u: 2,
        v: 9,
        lineWidth: 3,
        lineColor: "#929591",
        rotation: 300,
        scaleLength: 0.75,
        scaleWidth: 0.75
      }
    ]);
    pipelineStart.addItems([
      {
        id: "ma4",
        type: "arrow",
        u: 3,
        v: 9,
        lineWidth: 3,
        lineColor: "#929591",
        rotation: 0,
        scaleLength: 0.75,
        scaleWidth: 0.75
      }
    ]);
    pipelineStart.addItems([
      {
        id: "ma5",
        type: "arrow",
        u: 4,
        v: 8,
        lineWidth: 3,
        lineColor: "#929591",
        rotation: 60,
        scaleLength: 0.75,
        scaleWidth: 0.75
      }
    ]);
    pipelineStart.addItems([
      {
        id: "ma6",
        type: "arrow",
        u: 4,
        v: 7,
        lineWidth: 3,
        lineColor: "#929591",
        rotation: 120,
        scaleLength: 0.75,
        scaleWidth: 0.75
      }
    ]);
    //A small asteroid field. Double asteroids in the middle
    let EventEmitter = require("wolfy87-eventemitter");
    let asteroidEmitter = new EventEmitter();
    asteroidEmitter.addListener("mouseUp", e => {
      if (!e.mouseMoved) {
        this.props.addAlert({ type: "success", text: "Asteroids" });
      }
    });

    pipelineStart.addItems([
      {
        id: "asteroids1",
        type: "asteroids",
        u: -1,
        v: 10,
        emitter: asteroidEmitter
      },
      {
        id: "asteroids2",
        type: "asteroids",
        u: -2,
        v: 10,
        emitter: asteroidEmitter
      },
      {
        id: "asteroids3",
        type: "asteroids",
        u: -3,
        v: 10,
        emitter: asteroidEmitter
      }
    ]);
    pipelineStart.addItems([
      {
        id: "asteroids4",
        type: "asteroids",
        u: -3,
        v: 11,
        emitter: asteroidEmitter
      },
      {
        id: "asteroids5",
        type: "asteroids",
        u: -2,
        v: 11,
        emitter: asteroidEmitter
      },
      {
        id: "asteroids6",
        type: "asteroids",
        u: -2,
        v: 10,
        emitter: asteroidEmitter
      }
    ]);
    pipelineStart.addItems([
      {
        id: "asteroids7",
        type: "asteroids",
        u: -1,
        v: 9,
        emitter: asteroidEmitter
      },
      {
        id: "asteroids8",
        type: "asteroids",
        u: -2,
        v: 9,
        emitter: asteroidEmitter
      }
    ]);

    let stationEmitter = new EventEmitter();

    stationEmitter.addListener("mouseUp", e => {
      if (!e.mouseMoved) {
        this.props.addAlert({
          type: "info",
          text: "This could represent a space station"
        });
      }
    });

    pipelineStart.addItems([
      {
        id: "station",
        type: "polygon",
        diameter: 40,
        thickness: 5,
        sides: 5,
        color: "#0343df",
        u: 6,
        v: 5,
        emitter: stationEmitter
      }
    ]);

    let shipEmitter = new EventEmitter();
    let vector = null;
    shipEmitter.addListener("mouseUp", e => {
      if (!e.mouseMoved) {
        this.props.addAlert({
          type: "info",
          text: "Notice clicks check alpha of the texture"
        });
      } else {
        if (vector) {
          // Snap to grid
          // Remove the vector if in the same hex
        }
      }
    });
    shipEmitter.addListener("mouseDragged", () => {
      if (vector) {
        // Update the position of the vector
      } else {
        // If the drag event is outside of the source hex, create a new vector
      }
    });
    pipelineStart.addItems([
      {
        id: "ship",
        type: "ship",
        size: 50,
        u: 6,
        v: 5,
        angle: Math.PI,
        img: "./test.svg",
        isEmissive: true,
        emitter: shipEmitter,
        vectors: [
          {
            id: "vector1",
            type: "vector",
            size: 50,
            u: 0,
            v: 1,
            vectorU: 1,
            vectorV: 0,
            lineColor: "#0343df",
            lineWidth: 10,
            isEmissive: true,
            emitter: shipEmitter
          }
        ]
      }
    ]);
    pipelineStart.addItems([
      {
        id: "vertShip",
        type: "ship",
        size: 50,
        u: 6,
        v: 5,
        //angle: -Math.PI/4,
        img: "./test.svg",
        isEmissive: true,
        emitter: shipEmitter,
        vertical: true
      }
    ]);
    pipelineStart.addItems([
      {
        id: "vertShip2",
        type: "ship",
        size: 50,
        u: 6,
        v: 5,
        //angle: -Math.PI/4,
        img: "./test.svg",
        isEmissive: true,
        emitter: shipEmitter,
        vertical: true,
        vectors: [
          {
            id: "vector1",
            type: "vector",
            size: 50,
            u: 0,
            v: 1,
            vectorU: 1,
            vectorV: 0,
            lineColor: "#0343df",
            lineWidth: 10,
            isEmissive: true,
            emitter: shipEmitter
          }
        ]
      }
    ]);
    pipelineStart.addItems([
      {
        id: "vector1",
        type: "vector",
        size: 50,
        u: 0,
        v: 1,
        vectorU: 1,
        vectorV: 0,
        lineColor: "#0343df",
        lineWidth: 10,
        isEmissive: true,
        emitter: shipEmitter
      }
    ]);
    //Add a fleet of red 'ships' (triangles) on the dark side of the moon, and a fleet of green ships at the sun
    // Mostly demonstrates the ZStacking pipeline node
    pipelineStart.addItems([
      {
        id: "gs1",
        type: "polygon",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#15b01a",
        u: 1,
        v: 0
      },
      {
        id: "rs1",
        type: "polygon",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#e50000",
        u: 2,
        v: 9
      }
    ]);
    pipelineStart.addItems([
      {
        id: "gs2",
        type: "polygon",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#15b01a",
        u: 1,
        v: 0
      },
      {
        id: "rs2",
        type: "polygon",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#e50000",
        u: 2,
        v: 9
      }
    ]);
    pipelineStart.addItems([
      {
        id: "gs3",
        type: "polygon",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#15b01a",
        u: 1,
        v: 0
      },
      {
        id: "rs3",
        type: "polygon",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#e50000",
        u: 2,
        v: 9
      }
    ]);
    pipelineStart.addItems([
      {
        id: "gs4",
        type: "polygon",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#15b01a",
        u: 1,
        v: 0
      },
      {
        id: "rs4",
        type: "polygon",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#e50000",
        u: 2,
        v: 9
      }
    ]);
    pipelineStart.addItems([
      {
        id: "gs5",
        type: "polygon",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#15b01a",
        u: 1,
        v: 0
      },
      {
        id: "rs5",
        type: "polygon",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#e50000",
        u: 2,
        v: 9
      }
    ]);
    pipelineStart.addItems([
      {
        id: "gs6",
        type: "polygon",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#15b01a",
        u: 1,
        v: 0
      },
      {
        id: "rs6",
        type: "polygon",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#e50000",
        u: 2,
        v: 9
      }
    ]);
    pipelineStart.addItems([
      {
        id: "gs7",
        type: "polygon",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#15b01a",
        u: 1,
        v: 0
      },
      {
        id: "rs7",
        type: "polygon",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#e50000",
        u: 2,
        v: 9
      }
    ]);
    pipelineStart.addItems([
      {
        id: "gs8",
        type: "polygon",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#15b01a",
        u: 1,
        v: 0
      },
      {
        id: "rs8",
        type: "polygon",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#e50000",
        u: 2,
        v: 9
      }
    ]);
    pipelineStart.addItems([
      {
        id: "gs9",
        type: "polygon",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#15b01a",
        u: 1,
        v: 0
      },
      {
        id: "rs9",
        type: "polygon",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#e50000",
        u: 2,
        v: 9
      }
    ]);
    pipelineStart.addItems([
      {
        id: "gs10",
        type: "polygon",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#15b01a",
        u: 1,
        v: 0
      },
      {
        id: "rs10",
        type: "polygon",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#e50000",
        u: 2,
        v: 9
      }
    ]);
    pipelineStart.addItems([
      {
        id: "gs11",
        type: "polygon",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#15b01a",
        u: 1,
        v: 0
      },
      {
        id: "rs11",
        type: "polygon",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#e50000",
        u: 2,
        v: 9
      }
    ]);
    //Temp setup a basic light
    this.hexBoard.init();
  }

  componentWillUnmount() {
    //            this.props.glEventHub.off( 'map-state-changed', this.setComponentState );
    window.removeEventListener("resize", this.resizeListener);
  }
};

export default Map;
