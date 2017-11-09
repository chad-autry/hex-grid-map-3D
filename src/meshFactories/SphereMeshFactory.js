"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module SphereDrawnItemFactory
 */

var babylon = require("babylonjs");
/**
 * A factory to create the paper.js item for Sphere
 * @constructor
 * @param {external:cartesian-hexagonal} hexDefinition - The DTO defining the hex <--> cartesian relation
 */
module.exports = function SphereMeshFactory(hexDefinition) {
  this.hexDefinition = hexDefinition;
};

module.exports.prototype.hexToRgb = require("../HexToRGB.js");

/**
 * Returns a projected sphere drawn item for the given object
 * Object should have lineWidth, lineColor, backgroundColor, rotation, size, sliceCount, wedgeCount
 */
/**
 * Returns a vector drawn item for the given object
 * @param {Object} item - The DTO to produce a paper.js drawn item for
 * @param {Color} item.backgroundColor - The base color of the sphere
 * @param {Color} item.lineColor - The color of the latitude and longitude lines
 * @param {number} item.size - The size to draw the sphere at relative to a hex 100 means 100%
 * @param {number} item.lineWidth - The thickness of the latitude & longitude lines
 * @param {boolean} item.bright - True if this item is a star
 * @param {onClick=} item.onClick - The callback to use when clicking the vector
 * @returns {external:Mesh} The babylon.js Mesh representing the item
 * @implements {DrawnItemFactory#getDrawnItem}
 */
module.exports.prototype.getMesh = function(item, scene) {
  var diameter =
    item.size * this.hexDefinition.hexagon_edge_to_edge_width / 100;
  var sphere = babylon.Mesh.CreateSphere(item.id, 16, diameter, scene);

  var latitudeTexture = new babylon.DynamicTexture(
    "dynamic texture",
    512,
    scene,
    true
  );

  var latitudeMaterial = new babylon.StandardMaterial("mat", scene);
  latitudeMaterial.diffuseTexture = latitudeTexture;
  latitudeMaterial.specularColor = new babylon.Color3(0, 0, 0);
  latitudeMaterial.emissiveColor = new babylon.Color3(0.1, 0.1, 0.1);
  latitudeMaterial.backFaceCulling = true;

  sphere.material = latitudeMaterial;

  var context = latitudeTexture.getContext();
  var size = latitudeTexture.getSize();

  context.fillStyle = item.backgroundColor;
  context.fillRect(0, 0, size.width, size.height);

  //With how a texture is mapped against a sphere, we can do all the latitude lines and they have a consistent thickness
  var lineWidth = 2 * (item.lineWidth / (Math.PI * diameter)) * size.height; //Ratio of Latitudinal circumference to texture height
  context.lineWidth = lineWidth;
  context.strokeStyle = item.lineColor;

  context.beginPath();
  context.moveTo(0, size.height / 2);
  context.lineTo(size.width, size.height / 2);
  context.stroke();

  context.beginPath();
  context.moveTo(0, size.height / 6);
  context.lineTo(size.width, size.height / 6);
  context.stroke();

  context.beginPath();
  context.moveTo(0, size.height / 3);
  context.lineTo(size.width, size.height / 3);
  context.stroke();

  context.beginPath();
  context.moveTo(0, 2 * size.height / 3);
  context.lineTo(size.width, 2 * size.height / 3);
  context.stroke();

  context.beginPath();
  context.moveTo(0, 5 * size.height / 6);
  context.lineTo(size.width, 5 * size.height / 6);
  context.stroke();

  //For the longitudinal lines, if we just drew them straight they'd be shrunk at the poles.
  //Draw them bit by bit, with the width appropriate for the longitude
  context.lineWidth = 1;
  var equatorLineWidth = lineWidth;
  for (var i = 0; i < size.height; i++) {
    //What's our compresion ratio? The ratio of the equator circumference to the current slice's circumference
    lineWidth =
      equatorLineWidth *
      (Math.PI *
        diameter /
        (2 * Math.PI * (diameter * Math.sin(Math.PI * i / size.height))));

    //Draw the wide line just like a printer
    //The 0.5 is a twiddle factor because canvas co-ordinates are between pixels

    //Each path is one line. 2 lines meeting look turn into a great circle around the sphere.
    //Hard coded to 6 great circle, someone could make them configureable again if desired.
    context.beginPath();
    context.moveTo(size.height / 12 - 0.5 * lineWidth, i + 0.5);
    context.lineTo(size.height / 12 + 0.5 * lineWidth, i + 0.5);
    context.stroke();

    context.beginPath();
    context.moveTo(size.height / 4 - 0.5 * lineWidth, i + 0.5);
    context.lineTo(size.height / 4 + 0.5 * lineWidth, i + 0.5);
    context.stroke();

    context.beginPath();
    context.moveTo(5 * size.height / 12 - 0.5 * lineWidth, i + 0.5);
    context.lineTo(5 * size.height / 12 + 0.5 * lineWidth, i + 0.5);
    context.stroke();

    context.beginPath();
    context.moveTo(7 * size.height / 12 - 0.5 * lineWidth, i + 0.5);
    context.lineTo(7 * size.height / 12 + 0.5 * lineWidth, i + 0.5);
    context.stroke();

    context.beginPath();
    context.moveTo(9 * size.height / 12 - 0.5 * lineWidth, i + 0.5);
    context.lineTo(9 * size.height / 12 + 0.5 * lineWidth, i + 0.5);
    context.stroke();

    context.beginPath();
    context.moveTo(11 * size.height / 12 - 0.5 * lineWidth, i + 0.5);
    context.lineTo(11 * size.height / 12 + 0.5 * lineWidth, i + 0.5);
    context.stroke();
  }
  latitudeTexture.update(true);
  if (item.borderStar) {
    //The item is a star, give it an Emissive Color
    latitudeMaterial.emissiveColor = new babylon.Color3(1, 1, 1);
    //Give it a corona billboard
    var corona = babylon.MeshBuilder.CreateDisc(
      "t",
      {
        radius: diameter / 2 + item.borderStar.radius2,
        tessellation: 20,
        sideOrientation: babylon.Mesh.DOUBLESIDE
      },
      scene
    );

    var coronaTexture = new babylon.DynamicTexture(
      "dynamic texture",
      512,
      scene,
      true
    );
    coronaTexture.hasAlpha = true;

    var coronaMaterial = new babylon.StandardMaterial("mat", scene);
    coronaMaterial.emissiveColor = new babylon.Color3(1, 1, 1);
    coronaMaterial.diffuseTexture = coronaTexture;
    corona.material = coronaMaterial;

    context = coronaTexture.getContext();
    size = coronaTexture.getSize();

    var rot = Math.PI / 2 * 3;
    var x = size.width / 2;
    var y = size.height / 2;
    var step = Math.PI / item.borderStar.points;

    var outerRadius = size.width / 2;
    var innerRadius =
      outerRadius /
      (diameter / 2 + item.borderStar.radius2) *
      (diameter / 2 + item.borderStar.radius1);

    context.beginPath();
    context.moveTo(size.width / 2, size.height / 2 - outerRadius);
    for (i = 0; i < item.borderStar.points; i++) {
      x = size.width / 2 + Math.cos(rot) * outerRadius;
      y = size.height / 2 + Math.sin(rot) * outerRadius;
      context.lineTo(x, y);
      rot += step;

      x = size.width / 2 + Math.cos(rot) * innerRadius;
      y = size.height / 2 + Math.sin(rot) * innerRadius;
      context.lineTo(x, y);
      rot += step;
    }
    context.lineTo(size.width / 2, size.height / 2 - outerRadius);
    context.closePath();
    context.lineWidth = 0;
    context.strokeStyle = item.lineColor;
    context.stroke();
    context.fillStyle = item.borderStar.borderColor;
    context.fill();
    coronaTexture.update(true);

    corona.billboardMode = babylon.Mesh.BILLBOARDMODE_ALL;
    corona.parent = sphere;
  }

  //My native co-ordinate system is rotated from Babylon.js
  sphere.rotation.x = Math.PI / 2;

  sphere.data = {};
  sphere.data.item = item;
  return sphere;
};
