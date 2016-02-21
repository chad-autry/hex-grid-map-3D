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
    var updated = [];
    for (i = 0; i < event.added.length; i++) {
        
        if (!!event.added[i].target && !!event.added[i].source) {
            var path = [];
            var target = this.meshMap[event.added[i].target];
            var source = this.meshMap[event.added[i].source];
            var emitter0 = babylon.Mesh.CreateBox("emitter" + event.added[i].id, 0.1, this.scene);
            emitter0.position = source.position;

            var particleSystem = new babylon.ParticleSystem("particles", 2000, this.scene, null);
            
            
            particleSystem.particleTexture = new babylon.DynamicTexture("dynamic texture", 512, this.scene, true);
            var context = particleSystem.particleTexture.getContext();
            var radius = particleSystem.particleTexture.getSize().height/2;
            context.beginPath();
            context.arc(radius, radius, radius, 0, 2 * Math.PI, false);
            context.fillStyle = 'white';
            context.fill();
            context.lineWidth = 5;
            context.strokeStyle = 'white';
            context.stroke();
            var relativePosition = target.position.subtract(source.position);
            var distance = relativePosition.length();
            particleSystem.particleTexture.update(true);
            particleSystem.minSize = 5.0;
            particleSystem.maxSize = 10.0;
            particleSystem.minEmitPower = particleSystem.maxEmitPower = 1000.0;
            particleSystem.minLifeTime = particleSystem.maxLifeTime = distance/particleSystem.maxEmitPower;

            particleSystem.emitter = emitter0;
            particleSystem.emitRate = 100;
            //particleSystem.blendMode = babylon.ParticleSystem.BLENDMODE_ONEONE;
            particleSystem.direction1 = particleSystem.direction2 = relativePosition.normalize();
            //particleSystem.direction2 = target.position;
            //particleSystem.color1 = new babylon.Color4(1, 1, 0, 1);
            //particleSystem.color2 = new babylon.Color4(1, 0.5, 0, 1);
            //particleSystem.gravity = new babylon.Vector3(0, -1.0, 0);
            particleSystem.minEmitBox = new babylon.Vector3(0, 0, 0);
            particleSystem.maxEmitBox = new babylon.Vector3(0, 0, 0);
            particleSystem.start();
            
            //Update when the item is dragged
            if (!!target.data.item.onDrag) {
                this.decorateTargetOnDrag(particleSystem, target, source);
            }

        } else {
            this.meshMap[event.added[i].data.item.id] = event.added[i];
        }
    }

    this.emitEvent('dataChanged', [{added:event.added, removed:event.removed, updated:event.updated}]);
};

module.exports.prototype.setScene = function(scene) {
    this.scene = scene;
};

module.exports.prototype.decorateTargetOnDrag = function(particleSystem, target, source) {
    var targetOnDrag = target.data.item.onDrag;
    target.data.item.onDrag = function (screenX, screenY, planarX, planarY, clickedItem) {
        targetOnDrag(screenX, screenY, planarX, planarY, clickedItem);
        var relativePosition = clickedItem.position.subtract(source.position);
        var distance = relativePosition.length();
        particleSystem.direction1 = particleSystem.direction2 = relativePosition.normalize();
        particleSystem.minLifeTime = particleSystem.maxLifeTime = distance/particleSystem.maxEmitPower;
    };
};

