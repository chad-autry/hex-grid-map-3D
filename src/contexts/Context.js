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
 * @param {integer} cameraX - The x position on the plane the camera points at
 * @param {integer} cameraY - The y position on the plane the camera points at
 */

/**
 * Called on mouseDown with both the screen and planar x-y coordinates
 * @function Context#mouseDown
 * @param {integer} screenX - The x position of the mouse down event relative to the screen
 * @param {integer} screenY - The y position of the mouse down event relative to the screen
 * @param {integer} planarX - The x position of the mouse down event relative to the plane
 * @param {integer} planarY - The y position of the mouse down event relative to the plane
 * @returns {boolean} True if the context claims the click. Else False
 */

/**
 * Called as the mouse is dragged if the context claimed the click
 * @function Context#mouseDragged
 * @param {integer} screenX - The x position of the mouse drag event relative to the screen
 * @param {integer} screenY - The y position of the mouse drag event relative to the screen
 * @param {integer} planarX - The x position of the mouse drag event relative to the plane
 * @param {integer} planarY - The y position of the mouse drag event relative to the plane
 */

/**
 * Called when the mouse is released, serves double purpose as onMouseUp and onDragStop
 * @function Context#mouseReleased
 * @param {boolean} wasDrag - Boolean indicating if the mouse was moved at all before the release
 */
