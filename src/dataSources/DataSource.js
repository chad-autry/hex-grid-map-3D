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
    var items = []; //The data items

    this.addListener = function(listener) {
        listeners.push(listener);
    };
    
    this.addItems = function(items) {
        for (var i = 0; i < listeners.length; i++) {
	    listeners[i].onDataChanged({added:items, removed:[]});
        }
    };

    this.removeItems = function(items) {
        for (var i = 0; i < listeners.length; i++) {
        listeners[i].onDataChanged({added:[], removed:items});
        }
    };
};