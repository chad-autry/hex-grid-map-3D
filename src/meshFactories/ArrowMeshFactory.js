"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module ArrowDrawnItemFactory
 */
var babylon = require("babylonjs");

/**
 * Factory for creating arrow drawn items, such as might represent gravity
 * @constructor
 * @param {external:cartesian-hexagonal} hexDefinition - The DTO defining the hex <--> cartesian relation
 */
module.exports = function ArrowMeshFactory(hexDefinition) {
  this.hexDefinition = hexDefinition;
};

module.exports.prototype.hexToRgb = require("../HexToRGB.js");

/**
 * Return an arrow path item for the given object
 * @override
 * @param {Object} item - The DTO to produce a paper.js drawn item for
 * @param {integer} item.lineWidth - The extra width of the arrows border
 * @param {Color} item.lineColor - The color of the arrow's border
 * @param {Color} item.fillColor - The color to fill this item with
 * @param {integer} item.rotate - The angle in degrees to rotate, 0 degrees points ???
 * @param {number} item.scaleLength - Scale to make longer or shorter arrows, (0, 1]
 * @param {number} item.scaleWidth - Scale to make skinnier or thicker arrows, (0, 1]
 * @param {onClick=} item.onClick - The callback to use when clicking the arrow
 * @returns {external:Item} The paper.js Item representing the arrow
 * @implements {DrawnItemFactory#getDrawnItem}
 */
module.exports.prototype.getMesh = function(item, scene) {
  //A cylinder for each segment, and a sphere to join them smoothly
  //left pointy point then up and right
  var segment1 = babylon.Mesh.CreateTube(
    "segment1",
    [
      new babylon.Vector3(
        -this.hexDefinition.hexagon_edge_to_edge_width / 2,
        0,
        0
      ),
      new babylon.Vector3(0, -1 * this.hexDefinition.hexagon_half_wide_width, 0)
    ],
    item.lineWidth,
    20,
    null,
    0,
    scene
  );

  var sphere1 = babylon.Mesh.CreateSphere(
    "sphere1",
    20,
    2 * item.lineWidth,
    scene
  );
  sphere1.position.x = 0;
  sphere1.position.y = -1 * this.hexDefinition.hexagon_half_wide_width;

  //Then straight down
  var segment2 = babylon.Mesh.CreateTube(
    "segment2",
    [
      new babylon.Vector3(
        0,
        -1 * this.hexDefinition.hexagon_half_wide_width,
        0
      ),
      new babylon.Vector3(0, -this.hexDefinition.edgeSize / 2, 0)
    ],
    item.lineWidth,
    20,
    null,
    0,
    scene
  );

  var sphere2 = babylon.Mesh.CreateSphere(
    "sphere2",
    20,
    2 * item.lineWidth,
    scene
  );
  sphere2.position.x = 0;
  sphere2.position.y = -this.hexDefinition.edgeSize / 2;

  //Then right
  var segment3 = babylon.Mesh.CreateTube(
    "new",
    [
      new babylon.Vector3(0, -this.hexDefinition.edgeSize / 2, 0),
      new babylon.Vector3(
        this.hexDefinition.hexagon_edge_to_edge_width / 2,
        -this.hexDefinition.edgeSize / 2,
        0
      )
    ],
    item.lineWidth,
    20,
    null,
    0,
    scene
  );

  var sphere3 = babylon.Mesh.CreateSphere(
    "sphere1",
    20,
    2 * item.lineWidth,
    scene
  );
  sphere3.position.x = this.hexDefinition.hexagon_edge_to_edge_width / 2;
  sphere3.position.y = -this.hexDefinition.edgeSize / 2;

  //Then down again for the butt of the arrow
  var segment4 = babylon.Mesh.CreateTube(
    "segment4",
    [
      new babylon.Vector3(
        this.hexDefinition.hexagon_edge_to_edge_width / 2,
        -this.hexDefinition.edgeSize / 2,
        0
      ),
      new babylon.Vector3(
        this.hexDefinition.hexagon_edge_to_edge_width / 2,
        this.hexDefinition.edgeSize / 2,
        0
      )
    ],
    item.lineWidth,
    20,
    null,
    0,
    scene
  );

  var sphere4 = babylon.Mesh.CreateSphere(
    "sphere4",
    20,
    2 * item.lineWidth,
    scene
  );
  sphere4.position.x = this.hexDefinition.hexagon_edge_to_edge_width / 2;
  sphere4.position.y = this.hexDefinition.edgeSize / 2;

  //Then back left
  var segment5 = babylon.Mesh.CreateTube(
    "segment5",
    [
      new babylon.Vector3(
        this.hexDefinition.hexagon_edge_to_edge_width / 2,
        this.hexDefinition.edgeSize / 2,
        0
      ),
      new babylon.Vector3(0, this.hexDefinition.edgeSize / 2, 0)
    ],
    item.lineWidth,
    20,
    null,
    0,
    scene
  );

  var sphere5 = babylon.Mesh.CreateSphere(
    "sphere5",
    20,
    2 * item.lineWidth,
    scene
  );
  sphere5.position.x = 0;
  sphere5.position.y = this.hexDefinition.edgeSize / 2;

  //Then down
  var segment6 = babylon.Mesh.CreateTube(
    "segment6",
    [
      new babylon.Vector3(0, this.hexDefinition.edgeSize / 2, 0),
      new babylon.Vector3(0, this.hexDefinition.hexagon_half_wide_width, 0)
    ],
    item.lineWidth,
    20,
    null,
    0,
    scene
  );

  var sphere6 = babylon.Mesh.CreateSphere(
    "sphere1",
    20,
    2 * item.lineWidth,
    scene
  );
  sphere6.position.x = 0;
  sphere6.position.y = this.hexDefinition.hexagon_half_wide_width;

  //Then back to the point
  var segment7 = babylon.Mesh.CreateTube(
    "segment7",
    [
      new babylon.Vector3(0, this.hexDefinition.hexagon_half_wide_width, 0),
      new babylon.Vector3(
        -this.hexDefinition.hexagon_edge_to_edge_width / 2,
        0,
        0
      )
    ],
    item.lineWidth,
    20,
    null,
    0,
    scene
  );

  var sphere7 = babylon.Mesh.CreateSphere(
    "sphere7",
    20,
    2 * item.lineWidth,
    scene
  );
  sphere7.position.x = -this.hexDefinition.hexagon_edge_to_edge_width / 2;
  sphere7.position.y = 0;

  //merge them all
  var arrow = babylon.Mesh.MergeMeshes([
    segment1,
    segment2,
    segment3,
    segment4,
    segment5,
    segment6,
    segment7,
    sphere1,
    sphere2,
    sphere3,
    sphere4,
    sphere5,
    sphere6,
    sphere7
  ]);

  var arrowBorderMaterial = new babylon.StandardMaterial(
    "arrowBorderMaterial",
    scene
  );
  var rgb = this.hexToRgb(item.lineColor);
  arrowBorderMaterial.diffuseColor = new babylon.Color3(
    rgb.r / 256,
    rgb.g / 256,
    rgb.b / 256
  );
  //arrowBorderMaterial.specularColor = new babylon.Color3(rgb.r/256, rgb.g/256, rgb.b/256);
  arrowBorderMaterial.emissiveColor = new babylon.Color3(
    rgb.r / 256,
    rgb.g / 256,
    rgb.b / 256
  );
  arrow.material = arrowBorderMaterial;

  if (item.fillColor) {
    //Make the center
    var shape1 = [
      new babylon.Vector3(
        0,
        -1 * this.hexDefinition.hexagon_half_wide_width,
        0
      ),

      new babylon.Vector3(0, this.hexDefinition.hexagon_half_wide_width, 0),
      new babylon.Vector3(
        -this.hexDefinition.hexagon_edge_to_edge_width / 2,
        0,
        0
      ),
      new babylon.Vector3(0, -1 * this.hexDefinition.hexagon_half_wide_width, 0)
    ];

    //square
    var shape2 = [
      new babylon.Vector3(0, this.hexDefinition.edgeSize / 2, 0),
      new babylon.Vector3(0, -this.hexDefinition.edgeSize / 2, 0),
      new babylon.Vector3(
        this.hexDefinition.hexagon_edge_to_edge_width / 2,
        -this.hexDefinition.edgeSize / 2,
        0
      ),
      new babylon.Vector3(
        this.hexDefinition.hexagon_edge_to_edge_width / 2,
        this.hexDefinition.edgeSize / 2,
        0
      ),
      new babylon.Vector3(0, this.hexDefinition.edgeSize / 2, 0)
    ];

    //If we wanted to make a beveled or rounded edge, this extrusion would be the place to do it
    var extrudedCenter1 = babylon.Mesh.ExtrudeShape(
      "extruded",
      shape1,
      [
        new babylon.Vector3(0, 0, -1 * item.lineWidth),
        new babylon.Vector3(0, 0, item.lineWidth)
      ],
      1,
      0,
      babylon.Mesh.CAP_END,
      scene
    );

    //If we wanted to make a beveled or rounded edge, this extrusion would be the place to do it
    var extrudedCenter2 = babylon.Mesh.ExtrudeShape(
      "extruded",
      shape2,
      [
        new babylon.Vector3(0, 0, -1 * item.lineWidth),
        new babylon.Vector3(0, 0, item.lineWidth)
      ],
      1,
      0,
      babylon.Mesh.CAP_END,
      scene
    );

    //Color the center
    var arrowCenterMaterial = new babylon.StandardMaterial(
      "arrowCenterMaterial",
      scene
    );
    rgb = this.hexToRgb(item.fillColor);
    arrowCenterMaterial.diffuseColor = new babylon.Color3(
      rgb.r / 256,
      rgb.g / 256,
      rgb.b / 256
    );
    arrowCenterMaterial.specularColor = new babylon.Color3(
      rgb.r / 256,
      rgb.g / 256,
      rgb.b / 256
    );
    arrowCenterMaterial.emissiveColor = new babylon.Color3(
      rgb.r / 256,
      rgb.g / 256,
      rgb.b / 256
    );
    extrudedCenter1.material = extrudedCenter1.materia = arrowCenterMaterial;

    arrow = babylon.Mesh.MergeMeshes([arrow, extrudedCenter1, extrudedCenter2]);
  }

  //Scale the whole arror
  arrow.scaling.x = item.scaleLength;
  arrow.scaling.y = item.scaleWidth;
  arrow.rotation.z = item.rotation * Math.PI / 180;

  arrow.data = {};
  arrow.data.item = item;
  return arrow;
};
