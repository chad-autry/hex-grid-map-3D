import HexBoard from "../../../src/HexBoard.js";
import React from "react"; // eslint-disable-line no-unused-vars
import ReactDom from "react-dom"; // eslint-disable-line no-unused-vars
import GridContext from "../../../src/contexts/InverseGridContext.js";
import CellContext from "../../../src/contexts/CellContext.js";
import VectorDrawnItemFactory from "../../../src/drawnItemFactories/VectorDrawnItemFactory.js";
import PathDrawnItemFactory from "../../../src/drawnItemFactories/PathDrawnItemFactory.js"; // eslint-disable-line no-unused-vars
import ArrowDrawnItemFactory from "../../../src/drawnItemFactories/ArrowDrawnItemFactory.js";
import DelegatingDrawnItemFactory from "../../../src/drawnItemFactories/DelegatingDrawnItemFactory.js";
import DrawnItemContext from "../../../src/contexts/DrawnItemContext.js"; // eslint-disable-line no-unused-vars
import CellDrawnItemFactory from "../../../src/drawnItemFactories/RegularPolygonDrawnItemFactory";
import SphereDrawnItemFactory from "../../../src/drawnItemFactories/SphereDrawnItemFactory";
import FieldOfSquaresDrawnItemFactory from "../../../src/drawnItemFactories/FieldOfSquaresDrawnItemFactory";
import DrawnItemDataLink from "../../../src/dataLinks/DrawnItemDataLink";
import PlanarPositioningDataLink from "../../../src/dataLinks/PlanarPositioningDataLink";
import ZStackingDataLink from "../../../src/dataLinks/ZStackingDataLink";
import CloningDataLink from "../../../src/dataLinks/CloningDataLink";
import ConnectingDataLink from "../../../src/dataLinks/ConnectingDataLink";
import HexDefinition from "cartesian-hexagonal";
import makeDataLink from "data-chains/src/DataLinkMixin";
import EmittingDataSource from "data-chains/src/EmittingDataSource.js";

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
    // This line is important!
    this.setComponentState = this.setComponentState.bind(this);
    this.baseDataLink = props.dataLink;
  }

  render() {
    return (
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

    this.hexBoard = new HexBoard(this.canvasRef);
    //TODO Temp hard coded hexDimensions
    let hexDimensions = new HexDefinition(55, 1, 0, 3);
    this.hexBoard.setHexDimensions(hexDimensions);
    let contexts = [];

    //3D simplifies things alot actually (compared to keeping track of z-index in 2d and using multiple contexts)
    //There is the BackgroundContext, the GridContext, and then the CellContext handles everythign else (but in particular specializes in stacking things in a cell)

    //TODO Make the BackgroundContext which will draw a background based on the BackgroundItem sent to our DataSourceListener

    //Create and push the grid context
    contexts.push(new GridContext(hexDimensions));

    //Push the above grid cell context defined earlier
    //Create and link DecoratingDataSource which will take scenario DTOs and decorate them with the drawing information required by the DrawnItemFactories
    //The various contexts
    var simpleDrawnItemFactory = new CellDrawnItemFactory(hexDimensions);
    var sphereDrawnItemFactor = new SphereDrawnItemFactory(hexDimensions);
    var arrowDrawnItemFactory = new ArrowDrawnItemFactory(hexDimensions);
    var vectorDrawnItemFactory = new VectorDrawnItemFactory(hexDimensions);

    this.connectingDataLink = new ConnectingDataLink();
    this.connectingDataSource = new EmittingDataSource();
    this.connectingDataLink.setDataSource(this.connectingDataSource);

    //Make the initial decorating data link. Hard coded for now. Likely to move locations, and become user configureable. Add in ability to look up renderings for 'secret' items
    var decoratingDataLink = {};
    decoratingDataLink.onDataChanged = function(event) {
      var i;
      var decoratedAdditions = [];
      for (i = 0; i < event.added.length; i++) {
        decoratedAdditions.push(event.added[i]);
      }
      this.emitEvent("dataChanged", [
        { added: decoratedAdditions, removed: event.removed, updated: {} }
      ]);
    };

    makeDataLink.call(decoratingDataLink);
    //For Asteroids we use brown grey, brownish grey, greyish brown, grey brown. For debris would probablly go more blue-grey
    var asteroidFieldDrawnItemFactory = new FieldOfSquaresDrawnItemFactory(
      hexDimensions,
      9,
      20,
      ["#8d8468", "#86775f", "#7a6a4f", "#7f7053"]
    );
    var cellDrawnItemFactoryMap = {
      simple: simpleDrawnItemFactory,
      sphere: sphereDrawnItemFactor,
      arrow: arrowDrawnItemFactory,
      asteroids: asteroidFieldDrawnItemFactory,
      vector: vectorDrawnItemFactory
    };
    var cellDrawnItemFactory = new DelegatingDrawnItemFactory(
      cellDrawnItemFactoryMap
    );

    var drawnItemDataLink = new DrawnItemDataLink(cellDrawnItemFactory);
    drawnItemDataLink.setDataSource(decoratingDataLink);

    var cloningDataLink = new CloningDataLink();
    cloningDataLink.setDataSource(drawnItemDataLink);

    var planarPositioningDataLink = new PlanarPositioningDataLink(
      hexDimensions
    );
    planarPositioningDataLink.setDataSource(cloningDataLink);

    var zStackingDataLink = new ZStackingDataLink(10);
    zStackingDataLink.setDataSource(planarPositioningDataLink);

    var cellContext = new CellContext();
    contexts.push(cellContext);

    //Create a DataSourceListener which will intercept the MapMouseClicked item

    //Define and push the paths DataSource, DrawnItemFactory, and Context
    this.pathDataSource = new EmittingDataSource();
    this.pathDrawnItemFactory = new PathDrawnItemFactory(hexDimensions);
    this.pathContext = new DrawnItemContext(
      this.pathDrawnItemFactory,
      hexDimensions
    );
    this.pathContext.setDataSource(this.pathDataSource);
    contexts.push(this.pathContext);

    //Definte and push the vector DataSource, DrawnItemFactory, and Context
    this.vectorDataSource = new EmittingDataSource();
    this.vectorDrawnItemFactory = new VectorDrawnItemFactory(hexDimensions);
    var vectorContext = new DrawnItemContext(
      this.vectorDrawnItemFactory,
      hexDimensions
    );
    vectorContext.setDataSource(this.vectorDataSource);
    contexts.push(vectorContext);

    this.hexBoard.setContexts(contexts);

    this.hexBoard.setMouseClicked(
      (screenX, screenY, planarX, planarY, wasClaimed, wasDragged) => {
        if (!wasClaimed && !wasDragged) {
          var hexagonalCoordinates = hexDimensions.getReferencePoint(
            planarX,
            planarY
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
      }
    );

    this.hexBoard.init();
    drawnItemDataLink.setScene(this.hexBoard.scene);
    this.connectingDataLink.scene = this.hexBoard.scene;

    decoratingDataLink.setDataSource(this.baseDataLink);

    //Add a star
    //The rotation is the "nearly isometric" converted to radians. #f97306 = xkcd orange
    this.baseDataLink.addItems([
      {
        id: "sun",
        type: "sphere",
        size: 100,
        lineWidth: 5,
        greatCircleAngles: [0, Math.PI / 3, -Math.PI / 3],
        latitudeAngles: [
          0,
          Math.PI / 6,
          Math.PI / 3,
          -Math.PI / 6,
          -Math.PI / 3
        ],
        lineColor: "#f97306",
        backgroundColor: "#ffff14",
        borderStar: {
          radius1: 3,
          radius2: 6,
          points: 20,
          borderColor: "#f97306"
        },
        u: 0,
        v: 0
      }
    ]);

    //Add a sphere to represent earth
    this.baseDataLink.addItems([
      {
        id: "earth",
        type: "sphere",
        size: 66,
        lineWidth: 5,
        greatCircleAngles: [0, Math.PI / 3, -Math.PI / 3],
        latitudeAngles: [
          0,
          Math.PI / 6,
          Math.PI / 3,
          -Math.PI / 6,
          -Math.PI / 3
        ],
        lineColor: "#653700",
        backgroundColor: "#0343df",
        borderWidth: 2,
        borderColor: "#ffffff",
        u: 5,
        v: 5
      }
    ]);

    //Add a sphere to represent the moon
    this.baseDataLink.addItems([
      {
        id: "moon",
        type: "sphere",
        size: 33,
        lineWidth: 2.5,
        greatCircleAngles: [0, Math.PI / 3, -Math.PI / 3],
        latitudeAngles: [
          0,
          Math.PI / 6,
          Math.PI / 3,
          -Math.PI / 6,
          -Math.PI / 3
        ],
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
    this.baseDataLink.addItems([
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
    this.baseDataLink.addItems([
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
    this.baseDataLink.addItems([
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
    this.baseDataLink.addItems([
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
    this.baseDataLink.addItems([
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
    this.baseDataLink.addItems([
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
    this.baseDataLink.addItems([
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
    this.baseDataLink.addItems([
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
    this.baseDataLink.addItems([
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
    this.baseDataLink.addItems([
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
    this.baseDataLink.addItems([
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
    this.baseDataLink.addItems([
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
    this.baseDataLink.addItems([
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
    this.baseDataLink.addItems([
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
    this.baseDataLink.addItems([
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
    this.baseDataLink.addItems([
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
    this.baseDataLink.addItems([
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
    this.baseDataLink.addItems([
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

    //Add a fleet of red 'ships' (triangles) on the dark side of the moon, and a fleet of green ships at the sun
    this.baseDataLink.addItems([
      {
        id: "gs1",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#15b01a",
        u: 1,
        v: 0
      },
      {
        id: "rs1",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#e50000",
        u: 2,
        v: 9
      }
    ]);
    this.baseDataLink.addItems([
      {
        id: "gs2",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#15b01a",
        u: 1,
        v: 0
      },
      {
        id: "rs2",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#e50000",
        u: 2,
        v: 9
      }
    ]);
    this.baseDataLink.addItems([
      {
        id: "gs3",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#15b01a",
        u: 1,
        v: 0
      },
      {
        id: "rs3",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#e50000",
        u: 2,
        v: 9
      }
    ]);
    this.baseDataLink.addItems([
      {
        id: "gs4",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#15b01a",
        u: 1,
        v: 0
      },
      {
        id: "rs4",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#e50000",
        u: 2,
        v: 9
      }
    ]);
    this.baseDataLink.addItems([
      {
        id: "gs5",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#15b01a",
        u: 1,
        v: 0
      },
      {
        id: "rs5",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#e50000",
        u: 2,
        v: 9
      }
    ]);
    this.baseDataLink.addItems([
      {
        id: "gs6",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#15b01a",
        u: 1,
        v: 0
      },
      {
        id: "rs6",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#e50000",
        u: 2,
        v: 9
      }
    ]);
    this.baseDataLink.addItems([
      {
        id: "gs7",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#15b01a",
        u: 1,
        v: 0
      },
      {
        id: "rs7",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#e50000",
        u: 2,
        v: 9
      }
    ]);
    this.baseDataLink.addItems([
      {
        id: "gs8",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#15b01a",
        u: 1,
        v: 0
      },
      {
        id: "rs8",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#e50000",
        u: 2,
        v: 9
      }
    ]);
    this.baseDataLink.addItems([
      {
        id: "gs9",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#15b01a",
        u: 1,
        v: 0
      },
      {
        id: "rs9",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#e50000",
        u: 2,
        v: 9
      }
    ]);
    this.baseDataLink.addItems([
      {
        id: "gs10",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#15b01a",
        u: 1,
        v: 0
      },
      {
        id: "rs10",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#e50000",
        u: 2,
        v: 9
      }
    ]);
    this.baseDataLink.addItems([
      {
        id: "gs11",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#15b01a",
        u: 1,
        v: 0
      },
      {
        id: "rs11",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#e50000",
        u: 2,
        v: 9
      }
    ]);

    //A small asteroid field. Double asteroids in the middle
    var onClickAsteroids = () => {
      this.props.addAlert({ type: "success", text: "Asteroids" });
    };
    this.baseDataLink.addItems([
      {
        id: "asteroids1",
        type: "asteroids",
        u: -1,
        v: 10,
        onClick: onClickAsteroids
      },
      {
        id: "asteroids2",
        type: "asteroids",
        u: -2,
        v: 10,
        onClick: onClickAsteroids
      },
      {
        id: "asteroids3",
        type: "asteroids",
        u: -3,
        v: 10,
        onClick: onClickAsteroids
      }
    ]);
    this.baseDataLink.addItems([
      {
        id: "asteroids4",
        type: "asteroids",
        u: -3,
        v: 11,
        onClick: onClickAsteroids
      },
      {
        id: "asteroids5",
        type: "asteroids",
        u: -2,
        v: 11,
        onClick: onClickAsteroids
      },
      {
        id: "asteroids6",
        type: "asteroids",
        u: -2,
        v: 10,
        onClick: onClickAsteroids
      }
    ]);
    this.baseDataLink.addItems([
      {
        id: "asteroids7",
        type: "asteroids",
        u: -1,
        v: 9,
        onClick: onClickAsteroids
      },
      {
        id: "asteroids8",
        type: "asteroids",
        u: -2,
        v: 9,
        onClick: onClickAsteroids
      }
    ]);

    //A blue 'space station'
    var onClickStation = () => {
      this.props.addAlert({
        type: "success",
        text: "Do you believe I'm a space station? Use your imagination"
      });
    };
    this.baseDataLink.addItems([
      {
        id: "station",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 5,
        color: "#0343df",
        u: 6,
        v: 5,
        onClick: onClickStation
      }
    ]);

    //Dave
    var onClickDave = () => {
      if (!this.isDaveGoing) {
        this.isDaveGoing = true;
        this.vectorDataSource.addItems([
          {
            id: "daveVelocity",
            shaftWidth: 5,
            color: "#15b01a",
            sourceU: 0,
            sourceV: 4,
            destU: 0,
            destV: 6
          }
        ]);
        this.props.addAlert({
          type: "success",
          text: "This is Dave. Dave is going places. Go Dave, go."
        });
      } else {
        this.isDaveGoing = false;
        this.props.addAlert({ type: "warning", text: "Dave, slow down man." });

        this.vectorDataSource.removeItems([{ id: "daveVelocity" }]);
      }
    };

    var daveMiniMe = {
      id: "daveVelocity",
      type: "clone",
      clonesId: "dave",
      cloneAlpha: 0.5,
      cloneScale: 0.75,
      dragged: true,
      u: 0,
      v: 4
    };
    daveMiniMe.onDrag = (screenX, screenY, planarX, planarY, mesh) => {
      if (!this.lastPlanarX) {
        this.lastPlanarX = planarX;
        this.lastPlanarY = planarY;
        this.skipCellCentering = true;
        this.connectingDataSource.addItems([
          {
            id: mesh.position.x,
            distance: 20,
            color: "grey",
            radius: 5,
            sourceGap: 15,
            destGap: 10,
            target: daveMiniMe.id,
            source: "dave"
          }
        ]);
      }

      var dx = planarX - this.lastPlanarX;
      var dy = planarY - this.lastPlanarY;
      this.lastPlanarX = planarX;
      this.lastPlanarY = planarY;
      mesh.position.x = mesh.position.x + dx;
      mesh.position.y = mesh.position.y + dy;
      //TODO Directlly update any interested item (like a graphics connection) that this position has changed
    };

    var onDragDave = () => {
      if (!this.hasVelocity) {
        this.baseDataLink.addItems([
          daveMiniMe,
          { target: daveMiniMe.id, source: "dave" }
        ]);
        this.hasVelocity = true;
      }
    };

    this.baseDataLink.addItems([
      {
        id: "dave",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#15b01a",
        u: 0,
        v: 4,
        onClick: onClickDave,
        onDrag: onDragDave
      }
    ]);

    //Poetry
    this.baseDataLink.addItems([
      {
        id: "oneShip",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#ffffff",
        u: 3,
        v: 0,
        onClick: () => {
          this.props.addAlert({ type: "info", text: "One ship" });
        }
      }
    ]);
    this.baseDataLink.addItems([
      {
        id: "twoShip",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#ffffff",
        u: 4,
        v: 0,
        onClick: () => {
          this.props.addAlert({ type: "info", text: "Two ship" });
        }
      }
    ]);
    this.baseDataLink.addItems([
      {
        id: "twoShip2",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#ffffff",
        u: 4,
        v: 0,
        onClick: () => {
          this.props.addAlert({ type: "info", text: "Two ship" });
        }
      }
    ]);
    this.baseDataLink.addItems([
      {
        id: "redShip",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#e50000",
        u: 5,
        v: 0,
        onClick: () => {
          this.props.addAlert({ type: "info", text: "Red ship" });
        }
      }
    ]);
    this.baseDataLink.addItems([
      {
        id: "blueShip",
        type: "simple",
        diameter: 40,
        thickness: 5,
        sides: 3,
        color: "#0343df",
        u: 6,
        v: 0,
        onClick: () => {
          this.props.addAlert({ type: "info", text: "Blue ship" });
        }
      }
    ]);

    //A path around the Sun, Could represent the danger area for radiation
    this.pathDataSource.addItems([
      {
        width: 10,
        color: "#f97306",
        closed: true,
        points: [[0, -2], [-2, 0], [-2, 2], [0, 2], [2, 0], [2, -2]],
        onClick: () => {
          this.props.addAlert({ type: "warning", text: "Radiation! Beware!" });
        }
      }
    ]);
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
