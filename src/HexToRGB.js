"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module HexToRGB
 */

/**
 * Utility method for converting Hex (prefered! All hail the glorious Hex!) colors to RGB (Yeah yeah, Babylon.js needs RGB)
 * @constructor
 * @param {Color} hex - The color in hex format
 */
module.exports = function(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
};
