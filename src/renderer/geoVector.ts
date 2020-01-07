
function VecorRenderFeature(replayGroup, feature, style, squaredTolerance, listener, thisArg, options) {
    var loading = false;
    var imageStyle, imageState;
    imageStyle = style.getImage();
    if (imageStyle) {
        imageState = imageStyle.getImageState();
        if (imageState == (<any>ol).ImageState.LOADED ||
            imageState == (<any>ol).ImageState.ERROR) {
            imageStyle.unlistenImageChange(listener, thisArg);
        } else {
            if (imageState == (<any>ol).ImageState.IDLE) {
                imageStyle.load();
            }
            imageState = imageStyle.getImageState();
            imageStyle.listenImageChange(listener, thisArg);
            loading = true;
        }
    }
    renderFeature_(replayGroup, feature, style,
        squaredTolerance, options);

    return loading;
}

function renderFeature_(
    replayGroup, feature, style, squaredTolerance, options) {
    var geometry = style.getGeometryFunction()(feature);

    if (!geometry) {
        return;
    }
    var simplifiedGeometry = geometry.getSimplifiedGeometry(squaredTolerance);
    var renderer = style.getRenderer();
    if (renderer) {
        (<any>ol).renderer.vector.renderGeometry_(replayGroup, simplifiedGeometry, style, feature);
    } else {
        var geometryRenderer =
            GEOMETRY_RENDERERS_[simplifiedGeometry.getType()];

        geometryRenderer(replayGroup, simplifiedGeometry, style, feature, options);
    }
}

function renderPointGeometry_(replayGroup, geometry, style, feature) {
    var imageStyle = style.getImage();
    feature.zCoordinate = style.zCoordinate;
    if (imageStyle) {
        if (imageStyle.getImageState() != (<any>ol).ImageState.LOADED) {
            return;
        }
        // FIXME replace it with style.getZIndex()
        var imageReplay = replayGroup.getReplay(
            style.getZIndex(), (<any>ol.render).ReplayType.IMAGE);
        feature.pointCoordinates_ = geometry.getFlatCoordinates();
        imageReplay.startIndicesFeatures_.push(feature);
        var imageStyleClone = imageStyle.clone();
        imageStyleClone["offsetX"] = imageStyle["offsetX"];
        imageStyleClone["offsetY"] = imageStyle["offsetY"];
        imageStyleClone["allowOverlapping"] = imageStyle.allowOverlapping;
        imageStyleClone.declutterGroup_ = replayGroup.addDeclutter(replayGroup.hasDeclutterGroup);
        replayGroup.hasDeclutterGroup = true;
        imageReplay.startIndicesStyles_.push(imageStyleClone);
    }
    var textStyle = style.getText();
    if (textStyle) {
        var textReplay = replayGroup.getReplay(
            style.getZIndex(), (<any>ol.render).ReplayType.TEXT);
        textReplay.startIndicesFeatures_.push(feature);
        var textStyleClone = textStyle.clone();
        textStyleClone.label = textStyle.label;
        textStyleClone["placements"] = textStyle["placements"];
        textStyleClone["intervalDistance"] = textStyle["intervalDistance"];
        textStyleClone["spacing"] = textStyle["spacing"];
        textStyleClone.labelPosition = textStyle.labelPosition;
        textStyleClone.declutterGroup_ = replayGroup.addDeclutter(replayGroup.hasDeclutterGroup);
        replayGroup.hasDeclutterGroup = true;
        textReplay.startIndicesStyles_.push(textStyleClone);
    }
}

function renderLineStringGeometry_(replayGroup, geometry, style, feature, options) {
    var strokeStyle = style.getStroke();
    feature.zCoordinate = style.zCoordinate;
    if (strokeStyle) {
        var lineStringReplay = replayGroup.getReplay(
            style.getZIndex(), (<any>ol.render).ReplayType.LINE_STRING);
        lineStringReplay.setFillStrokeStyle(null, strokeStyle, geometry);
        lineStringReplay.drawLineString(geometry, feature, strokeStyle, options);
    }
    var textStyle = style.getText();
    if (textStyle) {
        var textReplay = replayGroup.getReplay(
            style.getZIndex(), (<any>ol.render).ReplayType.TEXT);
        textReplay.startIndicesFeatures_.push(feature);
        var textStyleClone = textStyle.clone();
        textStyleClone.label = textStyle.label;
        textStyleClone.labelPosition = textStyle.labelPosition;
        textStyleClone["placements"] = textStyle["placements"];
        textStyleClone["intervalDistance"] = textStyle["intervalDistance"];
        textStyleClone["spacing"] = textStyle["spacing"];
        textStyleClone.declutterGroup_ = replayGroup.addDeclutter(false);
        textStyleClone["zCoordinate"] = style["zCoordinate"]
        textReplay.startIndicesStyles_.push(textStyleClone);
    }
}

function renderMultiLineStringGeometry_(replayGroup, geometry, style, feature) {
    var strokeStyle = style.getStroke();
    feature.zCoordinate = style.zCoordinate;
    if (strokeStyle) {
        var lineStringReplay = replayGroup.getReplay(
            style.getZIndex(), (<any>ol.render).ReplayType.LINE_STRING);
        lineStringReplay.setFillStrokeStyle(null, strokeStyle);
        lineStringReplay.drawMultiLineString(geometry, feature);
    }
    var textStyle = style.getText();
    if (textStyle) {
        var textReplay = replayGroup.getReplay(
            style.getZIndex(), (<any>ol.render).ReplayType.TEXT);
        textReplay.startIndicesFeatures_.push(feature);
        var textStyleClone = textStyle.clone();
        textStyleClone.label = textStyle.label;
        textStyleClone.labelPosition = textStyle.labelPosition;
        textStyleClone["placements"] = textStyle["placements"];
        textStyleClone["intervalDistance"] = textStyle["intervalDistance"];
        textStyleClone["spacing"] = textStyle["spacing"];
        textStyleClone.declutterGroup_ = replayGroup.addDeclutter(false);
        textReplay.startIndicesStyles_.push(textStyleClone);
    }
}

function renderPolygonGeometry_(replayGroup, geometry, style, feature) {
    var fillStyle = style.getFill();
    var strokeStyle = style.getStroke();
    feature.zCoordinate = style.zCoordinate;
    if (fillStyle || strokeStyle) {
        var polygonReplay = replayGroup.getReplay(
            style.getZIndex(), (<any>ol.render).ReplayType.POLYGON);
        polygonReplay.setFillStrokeStyle(fillStyle, strokeStyle);
        polygonReplay.drawPolygon(geometry, feature);
    }
    var textStyle = style.getText();
    if (textStyle) {
        var textReplay = replayGroup.getReplay(
            style.getZIndex(), (<any>ol.render).ReplayType.TEXT);
        textReplay.startIndicesFeatures_.push(feature);
        var textStyleClone = textStyle.clone();
        textStyleClone.label = textStyle.label;
        textStyleClone.labelPosition = textStyle.labelPosition;
        textStyleClone["placements"] = textStyle["placements"];
        textStyleClone["intervalDistance"] = textStyle["intervalDistance"];
        textStyleClone["spacing"] = textStyle["spacing"];
        textStyleClone.declutterGroup_ = replayGroup.addDeclutter(false);
        textReplay.startIndicesStyles_.push(textStyleClone);
    }
    var imageStyle = style.getImage();
    if (imageStyle) {
        if (imageStyle.getImageState() != (<any>ol).ImageState.LOADED) {
            return;
        }
        var imageReplay = replayGroup.getReplay(
            style.getZIndex(), (<any>ol.render).ReplayType.BACKGROUNDIMAGE);
        imageReplay.setImageStyle(imageStyle, replayGroup.addDeclutter(false));
        imageReplay.indices = polygonReplay.indices.slice();
        imageReplay.vertices = polygonReplay.vertices.slice();
    }
}

function renderMultiPolygonGeometry_(replayGroup, geometry, style, feature) {
    var fillStyle = style.getFill();
    var strokeStyle = style.getStroke();
    feature.zCoordinate = style.zCoordinate;
    if (strokeStyle || fillStyle) {
        var polygonReplay = replayGroup.getReplay(
            style.getZIndex(), (<any>ol.render).ReplayType.POLYGON);
        polygonReplay.setFillStrokeStyle(fillStyle, strokeStyle);
        polygonReplay.drawMultiPolygon(geometry, feature);
    }
    var textStyle = style.getText();
    if (textStyle) {
        var textReplay = replayGroup.getReplay(
            style.getZIndex(), (<any>ol.render).ReplayType.TEXT);
        textReplay.startIndicesFeatures_.push(feature);
        var textStyleClone = textStyle.clone();
        textStyleClone.label = textStyle.label;
        textStyleClone.labelPosition = textStyle.labelPosition;
        textStyleClone["placements"] = textStyle["placements"];
        textStyleClone["intervalDistance"] = textStyle["intervalDistance"];
        textStyleClone["spacing"] = textStyle["spacing"];
        textStyleClone.declutterGroup_ = replayGroup.addDeclutter(false);
        textReplay.startIndicesStyles_.push(textStyleClone);
    }
}

var GEOMETRY_RENDERERS_ = {
    'Point': renderPointGeometry_,
    'LineString': renderLineStringGeometry_,
    'MultiPoint': (<any>ol).renderer.vector.renderMultiPointGeometry_,
    'MultiLineString': renderMultiLineStringGeometry_,
    'Polygon': renderPolygonGeometry_,
    'MultiPolygon': renderMultiPolygonGeometry_,
    'GeometryCollection': (<any>ol).renderer.vector.renderGeometryCollectionGeometry_,
    'Circle': (<any>ol).renderer.vector.renderCircleGeometry_
};

export {
    VecorRenderFeature
}
