"use strict";
/*
 * This is a drawn item factory which delegates to provided more specific factories by type
 */
function DelegatingDrawnItemFactory(drawnItemFactoryMap) {
    //Author's note: I learned with java, so this is a map of objects.
    // It could be a map of functions or closures. Is there any benefit to doing it that way other than a different type of thinking?
    this.drawnItemFactoryMap = drawnItemFactoryMap;
}

/**
 * Provides a paper.js item for the given business logic item
 * This particular implimentation expects the business logic item to have a 'type' attribute
 * Will delegate to a provided factory using the type
 */
DelegatingDrawnItemFactory.prototype.getDrawnItem = function(item) {
    var drawnItem;
    if (this.drawnItemFactoryMap.hasOwnProperty(item.type)) {
        return this.drawnItemFactoryMap[item.type].getDrawnItem(item);
    }
    return drawnItem;
};
module.exports = DelegatingDrawnItemFactory;