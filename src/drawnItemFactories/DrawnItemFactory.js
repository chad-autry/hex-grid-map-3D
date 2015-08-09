/**
 * Interface for factories that return a paper.js item given an input DTO
 * @interface DrawnItemFactory
 */
 
/**
 * Produces a paper.js representation of the given item. It is expected the original item is the returned items data.item property
 * @function DrawnItemFactory#getDrawnItem
 * @param {Object} item - The DTO to produce a paper.js drawn item for
 * @returns {external:Item} The paper.js Item representing the DTO.
 */