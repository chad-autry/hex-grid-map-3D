"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module DataSource
 */

 
/**
 * This function defines a minimal datasource for items. Expect dependent applications to impliment their own datasources which will listen to this one adding filtering, sorting, paging functionallity as desired
 * @constructor
 */
module.exports = function DataSource() {
    var listeners = []; //The listeners registered for change events
    var order = 0; //The order the items were added in for iteration
    var orderMapping = {};
    this.addListener = function(listener) {
        listeners.push(listener);
    };
    
    /**
     * Add items to this datasource
     * @param {Object[]} items - The array of items to add
     */
    this.addItems = function(items) {
        items.forEach(function(item) {
    	    orderMapping[item.id] = order;
    	    item.dataSourceIndex = order;
    	    order++;
    	    
        });
        for (var i = 0; i < listeners.length; i++) {
	    listeners[i].onDataChanged({added:items, removed:[]});
        }
    };

    /**
     * Remove items from this datasource
     * @param {Object[]} items - The array of items to remove
     */
    this.removeItems = function(items) {

        for (var i = 0; i < listeners.length; i++) {
            listeners[i].onDataChanged({added:[], removed:items});
        }
        

    };
    
};