
function VecorRenderFeature(replayGroup, feature, style, squaredTolerance, listener, thisArg, options){
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

function renderFeature_ (
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
          
      geometryRenderer(replayGroup, simplifiedGeometry, style, feature,options);
  }
}

function renderPointGeometry_ (replayGroup, geometry, style, feature) {
  var imageStyle = style.getImage();
  if (imageStyle) {
      if (imageStyle.getImageState() != (<any>ol).ImageState.LOADED) {
          return;
      }
      // FIXME replace it with style.getZIndex()
      var imageReplay = replayGroup.getReplay(
          6, (<any>ol.render).ReplayType.IMAGE);
      feature.pointCoordinates_ = geometry.getFlatCoordinates();
      imageReplay.startIndicesFeature.push(feature);
      var imageStyleClone = imageStyle.clone();
      imageStyleClone.declutterGroup_ = replayGroup.addDeclutter(false);
      imageReplay.startIndicesStyle.push(imageStyleClone);
  }
  var textStyle = style.getText();
  if (textStyle) {
      var textReplay = replayGroup.getReplay(
          2, (<any>ol.render).ReplayType.TEXT);
      textReplay.startIndicesFeature.push(feature);
      var textStyleClone = textStyle.clone();
      textStyleClone.label = textStyle.label;
      textStyleClone.labelPosition = textStyle.labelPosition;
      textStyleClone.declutterGroup_ = replayGroup.addDeclutter(!!imageStyle);
      textReplay.startIndicesStyle.push(textStyleClone);
  }
}

function renderLineStringGeometry_ (replayGroup, geometry, style, feature,options){
  var strokeStyle = style.getStroke();
  if (strokeStyle) {
      var lineStringReplay = replayGroup.getReplay(
          style.getZIndex(), (<any>ol.render).ReplayType.LINE_STRING);
      lineStringReplay.setFillStrokeStyle(null, strokeStyle,geometry);
      lineStringReplay.drawLineString(geometry, feature,strokeStyle,options);
  }
  var textStyle = style.getText();
  if (textStyle) {
      var textReplay = replayGroup.getReplay(
          3, (<any>ol.render).ReplayType.TEXT);
      textReplay.startIndicesFeature.push(feature); 
      var textStyleClone = textStyle.clone();
      textStyleClone.label = textStyle.label;
      textStyleClone.labelPosition = textStyle.labelPosition;
      textStyleClone.declutterGroup_ = replayGroup.addDeclutter(false);            
      textReplay.startIndicesStyle.push(textStyleClone); 
  }
}

function renderMultiLineStringGeometry_ (replayGroup, geometry, style, feature) {
  var strokeStyle = style.getStroke();
  if (strokeStyle) {
      var lineStringReplay = replayGroup.getReplay(
          style.getZIndex(), (<any>ol.render).ReplayType.LINE_STRING);
      lineStringReplay.setFillStrokeStyle(null, strokeStyle);
      lineStringReplay.drawMultiLineString(geometry, feature);
  }
  var textStyle = style.getText();
  if (textStyle) {
      var textReplay = replayGroup.getReplay(
          3, (<any>ol.render).ReplayType.TEXT);
      textReplay.startIndicesFeature.push(feature);
      var textStyleClone = textStyle.clone();
      textStyleClone.label = textStyle.label;
      textStyleClone.labelPosition = textStyle.labelPosition;
      textStyleClone.declutterGroup_ = replayGroup.addDeclutter(false);
      textReplay.startIndicesStyle.push(textStyleClone);
  }
}

function renderPolygonGeometry_(replayGroup, geometry, style, feature) {
    var fillStyle = style.getFill();
    var strokeStyle = style.getStroke();
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
        textReplay.startIndicesFeature.push(feature);
        var textStyleClone = textStyle.clone();
        textStyleClone.label = textStyle.label;
        textStyleClone.labelPosition = textStyle.labelPosition;
        textStyleClone.declutterGroup_ = replayGroup.addDeclutter(false);
        textReplay.startIndicesStyle.push(textStyleClone);
    }
}

function renderMultiPolygonGeometry_(replayGroup, geometry, style, feature) {
    var fillStyle = style.getFill();
    var strokeStyle = style.getStroke();
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
        textReplay.startIndicesFeature.push(feature);
        var textStyleClone = textStyle.clone();
        textStyleClone.label = textStyle.label;
        textStyleClone.labelPosition = textStyle.labelPosition;
        textStyleClone.declutterGroup_ = replayGroup.addDeclutter(false);
        textReplay.startIndicesStyle.push(textStyleClone);
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
