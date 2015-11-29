"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module SphereDrawnItemFactory
 */

var babylon = require('babylonjs');
/**
 * A factory to create the paper.js item for Sphere
 * @constructor
 * @param {external:cartesian-hexagonal} hexDefinition - The DTO defining the hex <--> cartesian relation
 */
module.exports = function SphereDrawnItemFactory(hexDefinition) {
    this.hexDefinition = hexDefinition;

};

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
 * @param {number} item.rotation - Starting as if viewed from above, the rotation of the top of the sphere up and back into the x-y plane
 * @param {number[]} item.greatCircleAngles - Longitude lines, measured in radians, straight up and down 0, clockwise +, counterclockwise -
 * @param {number[]} item.latitudeAngles - Latitude lines to draw measured in radians, equator 0, up +, down -
 * @param {number} item.lineWidth - The thickness of the latitude & longitude lines
 * @param {external:Star=} item.borderStar - The properties of a paper.js Star to use as the border of the sphere (gives it a serated border)
 * @param {onClick=} item.onClick - The callback to use when clicking the vector
 * @returns {external:Item} The paper.js Item representing the vector
 * @implements {DrawnItemFactory#getDrawnItem}
 */
module.exports.prototype.getDrawnItem = function(item, scene) {
    var diameter = item.size * this.hexDefinition.hexagon_edge_to_edge_width/100; //Draw it a bit big, we'll trim it into a circle
    var sphere = babylon.Mesh.CreateSphere(item.id, 16, diameter, scene);
    var material = new babylon.StandardMaterial("textureX", scene);
    var rgb = this.hexToRgb(item.backgroundColor);
    material.diffuseColor = new babylon.Color3(rgb.r/256, rgb.g/256, rgb.b/256);
    material.specularColor = new babylon.Color3(rgb.r/256, rgb.g/256, rgb.b/256);
    material.emissiveColor = new babylon.Color3(rgb.r/256, rgb.g/256, rgb.b/256);
    sphere.material = material;
    
    
    //Use a colored torus for the latitude and longitude lines (look at switching to a texture later)
    material = new babylon.StandardMaterial("textureX", scene);
    rgb = this.hexToRgb(item.lineColor);
    material.diffuseColor = new babylon.Color3(rgb.r/256, rgb.g/256, rgb.b/256);
    material.specularColor = new babylon.Color3(rgb.r/256, rgb.g/256, rgb.b/256);
    material.emissiveColor = new babylon.Color3(rgb.r/256, rgb.g/256, rgb.b/256);
    var torus;
    item.greatCircleAngles.forEach(function(angle) {
        torus = babylon.Mesh.CreateTorus("torus", diameter, item.lineWidth, 16, scene, false);
        torus.rotation.z = angle;
        torus.material = material;
        torus.parent = sphere;
    });
    
    item.latitudeAngles.forEach(function(angle) {
        torus = babylon.Mesh.CreateTorus("torus", diameter*Math.cos(angle), item.lineWidth, 16, scene, false);
        //rotate it flat
        torus.position.z = diameter*Math.sin(angle)/2;
        torus.rotation.x = Math.PI/2;
        torus.material = material;
        torus.parent = sphere;
    });
    
    sphere.data = {};
    sphere.data.item = item;
    return sphere;
    
    
};

module.exports.prototype.hexToRgb = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};