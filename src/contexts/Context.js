/**
 * Interface for context classes which manage a display/interaction layer of the hex map
 * @interface Context
 */

/**
 * Initialize the context with the paper.js group to draw to
 * @function Context#init
 * @param {external:Group} group - The group to manage
 */
 
/**
 * Called to update the layer's position as the map is scrolled (or jump to a position)
 * @function Context#updatePosition
 * @param {integer} dx - The total x translation of the map
 * @param {integer} dy - The total y translation of the map
 */
 
/**
 * Called to update the layer's position as the map is scrolled (or jump to a position)
 * @function Context#mouseDown
 * @param {integer} x - The x position of the mouse down event
 * @param {integer} y - The y position of the mouse down event
 * @returns {boolean} True if the context claims the click. Else False
 */ 
 
/**
 * Called as the mouse is dragged if the context claimed the click
 * @function Context#mouseDragged
 * @param {integer} x - The x position of the mouse drag event
 * @param {integer} y - The y position of the mouse drag event
 * @param {integer} dx - The x translation since the last event
 * @param {integer} dy - The y translation since the last event
 */
 
/**
 * Called when the mouse is release, serves double purpose as onMouseUp and onDragStop
 * @function Context#mouseReleased
 * @param {boolean} wasDrag - Boolean indicating if the mouse was moved at all before the release
 */
 
/**
 * Called when the context may need to redraw for some reason
 * @function Context#reDraw
 * @param {boolean} screenResized - Indicates if a redraw is required because of a resize (including mobile rotation)
 * @param {boolean} mapRotated - Indicates if a redraw is required because the map rotated
 * @param {boolean} mapScaled - Indicates if a redraw is required because the map was zoomed
 */