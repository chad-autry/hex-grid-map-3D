"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module ConnectingDataLink
 */
 var babylon = require('babylonjs/babylon.max.js');
 var makeDataLink = require('data-chains/src/DataLinkMixin');
 
/**
 * This datalink will draw a connection between the two given points, or two given items.
 * If given items it can listen for updates to those items.
 * @constructor
 */
module.exports = function ConnectingDataLink(scene) {
    //Protect the constructor from being called as a normal method
    if (!(this instanceof ConnectingDataLink)) {
        return new ConnectingDataLink();
    }
    makeDataLink.call(this);
    this.meshMap = {};
};

module.exports.prototype.onDataChanged = function(event) {

    var i, mesh, item, groupKey, cellGroup;
    var added = [];
    var updated = []
    for (i = 0; i < event.added.length; i++) {
        
        if (!!event.added[i].target && !!event.added[i].source) {
	    var path = [];
	    var target = this.meshMap[event.added[i].target];
	    var source = this.meshMap[event.added[i].source];
	    path.push(target.position);
	    path.push(source.position);
            //var emitter0 = BABYLON.Mesh.CreateBox("emitter0", 0.1, scene);
	    var emitter0 = babylon.Mesh.CreateLines("lines", path, this.scene, true);
            var particleSystem = new babylon.ParticleSystem("particles", 2000, this.scene, null);
            
            
                particleSystem.particleTexture = new babylon.FireProceduralTexture("fire", 256, this.scene);
	        particleSystem.minSize = 1.0;
	        particleSystem.maxSize = 1.0;
	        particleSystem.minLifeTime = 0.5;
	        particleSystem.maxLifeTime = 0.5;
	        //particleSystem.minEmitPower = 0.5;
	        //particleSystem.maxEmitPower = 3.0;
	        particleSystem.emitter = emitter0;
	        particleSystem.emitRate = 5;
	        //particleSystem.blendMode = babylon.ParticleSystem.BLENDMODE_ONEONE;
	        particleSystem.direction1 = target.position
	        particleSystem.direction2 = target.position
	        //particleSystem.color1 = new babylon.Color4(1, 1, 0, 1);
	        //particleSystem.color2 = new babylon.Color4(1, 0.5, 0, 1);
	        //particleSystem.gravity = new babylon.Vector3(0, -1.0, 0);
	        particleSystem.start();
	    	
	      particleSystem.minEmitBox = source.position;
              particleSystem.maxEmitBox = target.position;
        } else {
            this.meshMap[event.added[i].data.item.id] = event.added[i];
        }
    }

    this.emitEvent('dataChanged', [{added:event.added, removed:event.removed, updated:event.updated}]);
};

module.exports.prototype.setScene = function(scene) {
    this.scene = scene;
};



