"use strict";
/*
 * This function defines a minimal datasource for items. Expect client applications to impliment their own datasources which will listen to this one, and add filtering/sorting etc
 */
function DataSource() {
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
}

module.exports = DataSource;