"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module DataSource
 */
 
var sortedMap = require('collections/sorted-map');

 
/**
 * This function defines a minimal datasource for items. Expect dependent applications to impliment their own datasources which will listen to this one adding filtering, sorting, paging functionallity as desired
 * @constructor
 */
module.exports = function DataSource() {
    var listeners = []; //The listeners registered for change events
    var savedItems = sortedMap([], function(val1, val2){ return val1 === val2;},function(val1, val2){ return val1 - val2;}); // A search tree used to keep the individual cell groups sorted for insertion into the parent cell group
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
    	    savedItems.add(item, order);
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
        items.forEach(function(item) {
    	    savedItems.delete(orderMapping[item]);
        });
        for (var i = 0; i < listeners.length; i++) {
            listeners[i].onDataChanged({added:[], removed:items});
        }
        

    };
    
    /**
     * Iterate over ever item of this datasource with the provided callbacp
     * @param {forEachCallBack} callback - The callback
     * @param {Object=} thisp - The object to treat as this
     */
    this.forEach = function(callback, thisp) {
        savedItems.forEach(callback, thisp);
    };
};