/*
 * This function defines the base datasource for cell items. Expect client applications to impliment their own datasources which will listen to this one, and add filtering/sorting etc
 */
function baseCellDataSource() {
    var listeners = []; //The listeners registered for change events
    var items = []; //The data items

    this.addListener = function(listener) {
        listeners.push(listener);
    };
    
    this.addItems = function(items) {
        for (var i = 0; i < listeners.length; i++) {
	    listeners[i].onCellDataChanged({added:items, removed:[]});
        }
    };

    this.removeItems = function(items) {
        for (var i = 0; i < listeners.length; i++) {
        listeners[i].onCellDataChanged({added:[], removed:items});
        }
    };
}

module.exports = baseCellDataSource;