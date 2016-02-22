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
            var pathMeshArray = [];
            
            var pathMesh = babylon.MeshBuilder.CreateDisc("t", {radius:event.added[i].radius, tessellation: 20, sideOrientation: babylon.Mesh.DOUBLESIDE}, this.scene);
        


            var pathMeshMaterial = new babylon.StandardMaterial('mat', this.scene);
            pathMeshMaterial.emissiveColor = new babylon.Color3(1, 1, 1);
            var texture = new babylon.DynamicTexture("dynamic texture", 512, this.scene, true);
            pathMeshMaterial.diffuseTexture = texture;
            pathMesh.material = pathMeshMaterial;
            //Make a simple white circular texture
            texture.hasAlpha = true;
            var context = texture.getContext();
            var radius = texture.getSize().height/2;
            context.beginPath();
            context.arc(radius, radius, radius, 0, 2 * Math.PI, false);
            context.fillStyle = event.added[i].color;
            context.fill();
            context.stroke();
            texture.update(true);
            pathMesh.billboardMode = babylon.Mesh.BILLBOARDMODE_ALL;
            
            var relativePosition = target.position.subtract(source.position);
            var distance = relativePosition.length() - event.added[i].sourceGap - event.added[i].destGap;
            relativePosition.normalize();
            
            var numberOfItems = Math.floor(distance/event.added[i].distance);
            var itemCounter;
            for (itemCounter = 0; itemCounter < numberOfItems; itemCounter++) {
                pathMeshArray.push(pathMesh.clone());
                pathMeshArray[itemCounter].position = relativePosition.scale((itemCounter + 1)*event.added[i].distance + event.added[i].sourceGap).addInPlace( source.position);
            }
            
            //Update when the item is dragged
            if (!!target.data.item.onDrag) {
                this.decorateTargetOnDrag(target, source, pathMesh, pathMeshArray, event.added[i].distance, event.added[i].sourceGap, event.added[i].destGap);
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

module.exports.prototype.decorateTargetOnDrag = function(target, source, pathMesh, pathMeshArray, separation, sourceGap, destGap) {
    var targetOnDrag = target.data.item.onDrag;
    target.data.item.onDrag = function (screenX, screenY, planarX, planarY, clickedItem) {
        targetOnDrag(screenX, screenY, planarX, planarY, clickedItem);
            var relativePosition = target.position.subtract(source.position);
            var distance = relativePosition.length() - sourceGap - destGap;
            distance = 0 > distance ? 0 : distance;
            relativePosition.normalize();
            
            var numberOfItems = Math.floor(distance/separation);
            var itemCounter;
            //Reap
            for (itemCounter = pathMeshArray.length; itemCounter > numberOfItems; itemCounter--) {
                pathMeshArray[itemCounter - 1].dispose();
                pathMeshArray.length--;
            }
            pathMeshArray.slice(1, 3);
            //Re-use
            for (itemCounter = 0; itemCounter <pathMeshArray.length; itemCounter++) {
                pathMeshArray[itemCounter].position = relativePosition.scale((itemCounter + 1)*separation + sourceGap).addInPlace( source.position);
            }
            //Increase
            for ( ; itemCounter < numberOfItems; itemCounter++) {
                pathMeshArray.push(pathMesh.clone());
                pathMeshArray[itemCounter].position = relativePosition.scale((itemCounter + 1)*separation + sourceGap).addInPlace( source.position);
            }
    };
};

