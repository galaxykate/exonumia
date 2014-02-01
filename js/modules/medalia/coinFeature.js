/**
 * @author Kate Compton
 */
define(["common", "threeUtils", "graph", "ui"], function(common, threeUtils, Graph, UI) {
    var useMultiMaterial = false;
    defaultMaterial = new THREE.MeshNormalMaterial();
    var darkMaterial = new THREE.MeshBasicMaterial({
        color : 0xffffcc
    });
    var wireframeMaterial = new THREE.MeshBasicMaterial({
        color : 0x000000,
        wireframe : true,
        transparent : true
    });
    var phongMat = new THREE.MeshPhongMaterial({
        // light
        specular : '#a9fcff',
        // intermediate
        color : '#00abb1',
        // dark
        emissive : '#006063',
        shininess : 100
    });

    //  multiMaterial = [defaultMaterial, wireframeMaterial];
    multiMaterial = [phongMat, wireframeMaterial];
    defaultMaterial = phongMat;
    defaultMaterial.side = THREE.DoubleSide;

    // Just one shape, just one swiss geo
    var FeatureShape = Class.extend({
        init : function(feature, shape) {
            console.log("New feature shape");
            this.shape = shape;
            this.ringCount = 1;
            this.shape.idColor = feature.idColor;

            this.modgeo = new threeUtils.ModGeo.Swiss({
                outerPath : this.shape.outerPath.createLinearPath(3),
                innerPaths : this.shape.innerPaths,
                ringCount : this.ringCount,

            });
            var area = Math.abs(this.shape.outerPath.calculateArea());
            this.heightOffset = 50 - .004 * Math.pow(area, .8);
            console.log("OFFSET: " + area + " " + this.heightOffset);

        },

        getMesh : function() {
            if (useMultiMaterial)
                this.mesh = THREE.SceneUtils.createMultiMaterialObject(this.modgeo.createGeometry(), multiMaterial);
            else
                this.mesh = new THREE.Mesh(this.modgeo.createGeometry(), defaultMaterial);
            return this.mesh;
        },
    });

    var featureCount = 0;
    var CoinFeature = Class.extend({
        init : function(objTypeName, sliders, uiDiv) {
            this.idNumber = featureCount;
            this.classID = objTypeName;
            this.idColor = common.KColor.makeIDColor(this.idNumber * .7);
            this.id = objTypeName + this.idNumber;
            featureCount++;

            this.currentValues = {
            };
            this.mesh = new THREE.Object3D();
            this.shape = new Graph.Shape(objTypeName + this.idNumber);

            this.featureShapes = [];

            this.buildUI(uiDiv, sliders);

            this.ready = true;
            console.log("READY " + this);
            this.rebuild();
        },

        update : function(time) {

        },

        getCurrentValue : function(valueName) {
            if (this.currentValues.hasOwnProperty(valueName))
                return this.currentValues[valueName];
            else
                throw (this.id + " has no current value for " + valueName);
        },

        buildSliders : function(uiDiv, sliders) {
            console.log("Build sliders");
            var feature = this;

            var sliderHolder = $("<div/>", {
                id : this.id + "_sliderholder",
                "class" : this.classID + "_sliderholder",
            });

            for (var prop in sliders) {
                if (sliders.hasOwnProperty(prop)) {
                    var setting = sliders[prop];
                    this.addSlider(sliderHolder, prop, setting);
                }
            }

            uiDiv.append(sliderHolder);
        },

        addSlider : function(sliderHolder, prop, setting) {

            var feature = this;
            app.ui.addSlider(sliderHolder, setting.name, setting.defaultVal, setting.min, setting.max, function(key, val) {
                feature.currentValues[prop] = val;

                // Apply the onchange fxn
                feature[setting.onChange]();
            });
        },

        buildUIDetails : function(uiDiv) {

        },

        buildUI : function(uiDiv, sliders) {
            var uiHolder = $("<div/>", {
                id : this.id + "_uiholder",

                "class" : this.classID + "_uiholder"
            });

            uiDiv.append(uiHolder);
            var bgColor = this.idColor.cloneShade(.5, 1);
            uiHolder.css({
                "background" : bgColor.toCSS(),
            })

            // Make an area for UI and an area for sliders,
            this.buildUIDetails(uiHolder);
            // sliders go at bottom
            this.buildSliders(uiHolder, sliders);
        },

        buildShapeDetails : function() {

        },

        // Build whatever shape is needed
        buildShape : function() {
            this.shape.clear();
            this.featureShapes = [];
            this.buildShapeDetails();
            for (var i = 0; i < this.featureShapes.length; i++) {
                this.shape.addShape(this.featureShapes[i].shape);
            }
        },

        buildMesh : function() {
            // Remove all the featureshapes
            for ( i = this.mesh.children.length - 1; i >= 0; i--) {
                var obj = this.mesh.children[i];
                this.mesh.remove(obj);

            }

            for (var i = 0; i < this.featureShapes.length; i++) {
                this.mesh.add(this.featureShapes[i].getMesh());
            }

            this.remod();
        },

        modEdgeVertex : function(p, context) {
            var bump = 1 + .05 * Math.sin(context.pctRing * 3);
            var i = context.segment;
            var node = context.path.nodes[i];
            p.x = node.x * bump;
            p.y = node.y * bump;

            var s = context.featureShape.heightOffset;

            p.z = -(1 - context.pctRing) * (this.currentValues.height + s);
        },

        remod : function() {

            var feature = this;

            if (this.isReady()) {

                console.log("Remod " + this);
                for (var i = 0; i < this.featureShapes.length; i++) {
                    var fs = this.featureShapes[i];
                    fs.modgeo.modOuterRing(function(p, context) {
                        context.featureShape = fs;
                        feature.modEdgeVertex(p, context);
                    });

                    fs.modgeo.update();
                }

            }
        },

        rebuild : function() {

            if (this.isReady()) {
                console.log("Rebuild " + this);
                this.shape.clear();
                this.buildShape();
                this.buildMesh();
                this.remod();
            }
        },

        isReady : function() {
            return this.ready;
        },

        toString : function() {
            var s = this.id;
            for (var prop in this.currentValues) {
                if (this.currentValues.hasOwnProperty(prop)) {
                    var p = this.currentValues[prop];
                    s += " " + prop + ": " + p;
                }
            }

            s += ", " + this.featureShapes.length + " feature shapes";
            return s;
        }
    });

    CoinFeature.FeatureShape = FeatureShape;
    return CoinFeature;

});
