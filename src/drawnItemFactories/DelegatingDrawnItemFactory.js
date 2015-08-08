"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module DelegatingDrawnItemFactory
 */

/**
 * A factory which delegates getDrawnItem calls to another factory based on the item's type property
 * @constructor
 * @param {Object.<string, DrawnItemFactory>} drawnItemFactoryMap - The map of factories
 */
module.exports = function DelegatingDrawnItemFactory(drawnItemFactoryMap) {
    //Author's note: I learned with java, so this is a map of objects.
    // It could be a map of functions or closures. Is there any benefit to doing it that way other than a different type of thinking?
    this.drawnItemFactoryMap = drawnItemFactoryMap;
};

/**
 * Return a path item for the given DTO, the object should have all properties of the target factory as well as the type
 * @override
 * @param {Object} item - The DTO to produce a paper.js drawn item for
 * @param {string} item.type - The type of the item, used to map to the target factory
 * @returns {external:Item} The paper.js Item for the given parameters
 * @implements {DrawnItemFactory#getDrawnItem}
 */
module.exports.prototype.getDrawnItem = function(item) {
    var drawnItem;
    if (this.drawnItemFactoryMap.hasOwnProperty(item.type)) {
        return this.drawnItemFactoryMap[item.type].getDrawnItem(item);
    }
    return drawnItem;
};