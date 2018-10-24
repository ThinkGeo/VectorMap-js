import GeoStyle from './geoStyle';
import { Point, LineString, MultiPolygon, LinearRing, Polygon } from 'ol/geom';
import { Style, Stroke, Fill, Icon } from 'ol/style'

class GeoLineStyle extends GeoStyle {
    constructor(styleJson) {
        super(styleJson);
        this.lineStroke = new Stroke();
        this.lineStyle = new Style({ stroke: this.lineStroke });
        this.lineCapFill = new Fill();
        this.lineCapStyle = new Style({ fill: this.lineCapFill });

        this.lineInnerStroke = new Stroke();
        this.lineInnerStyle = new Style({ stroke: this.lineInnerStroke });
        this.lineCapInnerFill = new Fill();
        this.lineCapInnerStyle = new Style({
            fill: this.lineCapInnerFill
        });

        this.lineCenterStroke = new Stroke();
        this.lineCenterStyle = new Style({
            stroke: this.lineCenterStroke
        });
        this.lineCapCenterFill = new Fill();
        this.lineCapCenterStyle = new Style({
            fill: this.lineCapCenterFill
        });

        if (styleJson) {
            this.lineCap = styleJson["line-cap"];
            this.color = styleJson["line-color"];
            this.dashArray = styleJson["line-dasharray"];
            this.gamma = styleJson["line-gamma"];
            this.geometryTransform = styleJson["line-geometry-transform"];
            this.lineJoin = styleJson["line-join"];
            this.miterLimit = styleJson["line-miterlimit"];
            this.offset = styleJson["line-offset"];
            this.opacity = styleJson["line-opacity"];
            this.width = styleJson["line-width"];
            this.lineCapInner = styleJson["line-cap-inner"];
            this.colorInner = styleJson["line-color-inner"];
            this.dashArrayInner = styleJson["line-dasharray-inner"];
            this.lineJoinInner = styleJson["line-join-inner"];
            this.miterLimitInner = styleJson["line-miterlimit-inner"];
            this.widthInner = styleJson["line-width-inner"];
            this.lineCapCenter = styleJson["line-cap-center"];
            this.colorCenter = styleJson["line-color-center"];
            this.dashArrayCenter = styleJson["line-dasharray-center"];
            this.lineJoinCenter = styleJson["line-join-center"];
            this.miterLimitCenter = styleJson["line-miterlimit-center"];
            this.widthCenter = styleJson["line-width-center"];
            this.onewaySymbol = styleJson["line-oneway-symbol"];
        }
    }

    initializeCore() {
        if (this.color) {
            this.olColor = GeoStyle.toRGBAColor(this.color, this.opacity);

            this.lineStroke.setColor(this.olColor);
            this.lineCapFill.setColor(this.olColor);
        }
        if (this.dashArray) {
            let tmpArray = this.dashArray.split(",");
            for (let a of tmpArray) {
                this.convertedDashArray.push(parseFloat(a));
            }
        }

        // Drawing inner
        if (this.colorInner) {
            this.olInnerColor = GeoStyle.toRGBAColor(this.colorInner, this.opacity);

            this.lineInnerStroke.setColor(this.olInnerColor);
            this.lineCapInnerFill.setColor(this.olInnerColor);
        }
        if (this.dashArrayInner) {
            let tmpArray = this.dashArrayInner.split(",");
            for (let a of tmpArray) {
                this.convertedInnerDashArray.push(parseFloat(a));
            }
        }

        // Drawing center
        if (this.colorCenter) {
            this.olCenterColor = GeoStyle.toRGBAColor(this.colorCenter, this.opacity);
            this.lineCenterStroke.setColor(this.olCenterColor);
            this.lineCapCenterFill.setColor(this.olCenterColor);
        }
        if (this.dashArrayCenter) {
            let tmpArray = this.dashArrayCenter.split(",");
            for (let a of tmpArray) {
                this.convertedCenterDashArray.push(parseFloat(a));
            }
        }

        if (this.onewaySymbol) {
            this.onewayIcon = new Icon({
                src: this.onewaySymbol,
                imgSize: [18, 5],
                anchor: [0.5, 0.5],
                rotateWithView: true
            });

            this.onewayStyle = new Style({
                image: this.onewayIcon
            });
        }
    }

    getTransformValues(transform) {
        // get transform values which look like transform(value1, value2)
        let start = transform.indexOf("(");
        let end = transform.indexOf(")");
        let valueString = transform.substring(start + 1, end);

        let values = [];
        if (valueString.includes(",")) {
            values = valueString.split(",");
        } else {
            values.push(valueString);
        }

        return values;
    }

    getConvertedStyleCore(feature, resolution, options) {
        let length = 0;
        this.styles = [];

        if (this.color && this.width) {
            if (this.olLineCapsMap[this.lineCap]) {
                this.lineStroke.setLineCap(this.olLineCapsMap[this.lineCap]);
            }
            if (this.color) {
                this.lineStroke.setColor(this.olColor);
                this.lineCapFill.setColor(this.olColor);
            }
            if (this.dashArray) {
                this.lineStroke.setLineDash(this.convertedDashArray);
            }
            if (this.lineJoin) {
                this.lineStroke.setLineJoin(this.lineJoin);
            }
            if (this.miterLimit !== 4) {
                this.lineStroke.setMiterLimit(this.miterLimit);
            }
            if (this.width) {
                this.lineStroke.setWidth(this.width);
            }

            // Set inner
            if (this.colorInner) {
                this.lineInnerStroke.setColor(this.olInnerColor);
                this.lineCapInnerFill.setColor(this.olInnerColor);
            }
            if (this.dashArrayInner) {
                this.lineInnerStroke.setLineDash(this.convertedInnerDashArray);
            }
            if (this.lineJoinInner) {
                this.lineInnerStroke.setLineJoin(this.lineJoinInner);
            }
            if (this.miterLimitInner !== 4) {
                this.lineInnerStroke.setMiterLimit(this.miterLimitInner);
            }
            if (this.widthInner) {
                this.lineInnerStroke.setWidth(this.widthInner);
            }

            // Set center
            if (this.colorCenter) {
                this.lineCenterStroke.setColor(this.olCenterColor);
                this.lineCapCenterFill.setColor(this.olCenterColor);
                this.lineCenterStroke.setLineCap("butt");
            }
            if (this.dashArrayCenter) {
                this.lineCenterStroke.setLineDash(this.convertedCenterDashArray);
            }
            if (this.lineJoinCenter) {
                this.lineCenterStroke.setLineJoin(this.lineJoinCenter);
            }
            if (this.miterLimitCenter !== 4) {
                this.lineCenterStroke.setMiterLimit(this.miterLimitCenter);
            }
            if (this.widthCenter) {
                this.lineCenterStroke.setWidth(this.widthCenter);
            }

            let geometryFunction = (feature) => {
                if (this.geometryTransform) {
                    let geometry = this.getGeometry(feature);
                    if (this.geometryTransform) {
                        let values = this.getTransformValues(this.geometryTransform);

                        if (this.geometryTransform.indexOf("translate") === 0) {
                            geometry.translate(+values[0].trim(), +values[1].trim());
                        } else if (this.geometryTransform.indexOf("scale") === 0) {
                            geometry.scale(+values[0].trim(), +values[1].trim());
                        } else if (this.geometryTransform.indexOf("rotate") === 0) {
                            let center = ol.extent.getCenter(geometry.getExtent());
                            let angle = +values[0].trim() * Math.PI / 180;
                            geometry.rotate(angle, center);
                        } else if (this.geometryTransform.indexOf("skew") === 0) {
                            this.skewGeometry(geometry, +values[0].trim(), +values[1].trim());
                        }
                    }
                }
                return feature.getGeometry();
            };

            this.lineStyle.setGeometry(geometryFunction);

            this.styles[length++] = this.lineStyle;

            if (this.gamma !== undefined && options.layer) {
                let styleGamma = this.gamma;
                options.layer.on("precompose", function (evt) {
                    evt.context.imageSmoothingEnabled = styleGamma;
                    evt.context.webkitImageSmoothingEnabled = styleGamma;
                    evt.context.mozImageSmoothingEnabled = styleGamma;
                    evt.context.msImageSmoothingEnabled = styleGamma;
                });
            }

            if (this.geometryLineCaps.includes(this.lineCap)) {
                let geometryFunction = (feature) => {
                    let geometry = this.getGeometry(feature);
                    return GeoLineStyle.createAnchoredGeometry(
                        geometry,
                        this.lineCap,
                        this.width,
                        resolution
                    );
                };

                this.lineCapStyle.setGeometry(geometryFunction);
                this.styles[length++] = this.lineCapStyle;
            }

            // Drawing inner
            if (this.colorInner && this.widthInner) {
                let geometryFunction = (feature) => {
                    let geometry = this.getGeometry(feature);
                    if (this.geometryTransform) {
                        let values = this.getTransformValues(this.geometryTransform);

                        if (this.geometryTransform.indexOf("translate") === 0) {
                            geometry.translate(+values[0].trim(), +values[1].trim());
                        } else if (this.geometryTransform.indexOf("scale") === 0) {
                            geometry.scale(+values[0].trim(), +values[1].trim());
                        } else if (this.geometryTransform.indexOf("rotate") === 0) {
                            let center = ol.extent.getCenter(geometry.getExtent());
                            let angle = +values[0].trim() * Math.PI / 180;
                            geometry.rotate(angle, center);
                        } else if (this.geometryTransform.indexOf("skew") === 0) {
                            this.skewGeometry(geometry, +values[0].trim(), +values[1].trim());
                        }
                    }
                    return feature.getGeometry();
                };
                this.lineInnerStyle.setGeometry(geometryFunction);
                this.styles[length++] = this.lineInnerStyle;

                if (this.geometryLineCaps.includes(this.lineCapInner)) {
                    let geometryFunction = (feature) => {
                        let geometry = this.getGeometry(feature);
                        return GeoLineStyle.createAnchoredGeometry(
                            geometry,
                            this.lineCapInner,
                            this.widthInner,
                            resolution
                        );
                    };
                    this.lineCapInnerStyle.setGeometry(geometryFunction);
                    this.styles[length++] = this.lineCapInnerStyle;
                }
            }

            // Drawing center
            if (this.colorCenter && this.widthCenter) {
                let geometryFunction = (feature) => {
                    let geometry = this.getGeometry(feature);
                    if (this.geometryTransform) {
                        let values = this.getTransformValues(this.geometryTransform);

                        if (this.geometryTransform.indexOf("translate") === 0) {
                            geometry.translate(+values[0].trim(), +values[1].trim());
                        } else if (this.geometryTransform.indexOf("scale") === 0) {
                            geometry.scale(+values[0].trim(), +values[1].trim());
                        } else if (this.geometryTransform.indexOf("rotate") === 0) {
                            let center = ol.extent.getCenter(geometry.getExtent());
                            let angle = +values[0].trim() * Math.PI / 180;
                            geometry.rotate(angle, center);
                        } else if (this.geometryTransform.indexOf("skew") === 0) {
                            this.skewGeometry(geometry, +values[0].trim(), +values[1].trim());
                        }
                    }
                    return feature.getGeometry();
                };

                this.lineCenterStyle.setGeometry(geometryFunction);
                this.styles[length++] = this.lineCenterStyle;

                if (this.geometryLineCaps.includes(this.lineCapCenter)) {
                    let geometryFunction = (feature) => {
                        let geometry = this.getGeometry(feature);
                        return GeoLineStyle.createAnchoredGeometry(
                            geometry,
                            this.lineCapCenter,
                            this.widthCenter,
                            resolution
                        );
                    };
                    this.lineCapCenterStyle.setGeometry(geometryFunction);
                    this.styles[length++] = this.lineCapCenterStyle;
                }
            }
        }

        if (this.onewaySymbol) {
            let flatCoordinates = feature.getFlatCoordinates();
            let longest = 0;
            let longestIndex;
            for (let i = 0; i <= flatCoordinates.length - 4; i += 2) {
                let dX = Math.abs(flatCoordinates[i] - flatCoordinates[i + 2]);
                let dY = Math.abs(flatCoordinates[i + 1] - flatCoordinates[i + 3]);
                let distance = dX + dY;
                if (distance > longest) {
                    longest = distance;
                    longestIndex = i;
                }
            }

            let start = [flatCoordinates[longestIndex], flatCoordinates[longestIndex + 1]];
            let end = [flatCoordinates[longestIndex + 2], flatCoordinates[longestIndex + 3]];
            let dx = end[0] - start[0];
            let dy = end[1] - start[1];
            let rotation = Math.atan2(dy, dx);
            let centerPoint = [(start[0] + end[0]) * 0.5, (start[1] + end[1]) * 0.5];
            let geometry = new Point(centerPoint, "XY");

            this.onewayIcon.rotation_ = -rotation;

            this.onewayStyle.setGeometry(geometry);
            this.styles[length++] = this.onewayStyle;
        }

        return this.styles;
    }

    getGeometry(feature) {
        let tmpFlatCoordinates = feature.getFlatCoordinates();
        let tmpCoordinates = [];
        for (let i = 0; i < tmpFlatCoordinates.length; i += 2) {
            tmpCoordinates.push([tmpFlatCoordinates[i], tmpFlatCoordinates[i + 1]]);
        }
        return new LineString(tmpCoordinates);
    }
}

GeoLineStyle["createAnchoredGeometry"] = function (geometry, lineCap, lineWidth, resolution) {
    let segments = GeoLineStyle.getTerminalSegments(geometry);
    let linearRing;
    let multiPolygon = new MultiPolygon([]);
    for (let segment of segments) {
        let first = segment[0];
        let last = segment[1];
        let delta = lineWidth * resolution / 2;
        let translateDelta = (lineWidth - 1) * resolution / 2;
        switch (lineCap) {
            case "triangle":
                linearRing = new LinearRing([
                    [last[0], last[1] + delta],
                    [last[0] + delta, last[1]],
                    [last[0], last[1] - delta],
                    [last[0], last[1] + delta]
                ]);
                break;
            case "squareanchor":
                delta *= 1.5;
                linearRing = new LinearRing([
                    [last[0] - delta, last[1] + delta],
                    [last[0] + delta, last[1] + delta],
                    [last[0] + delta, last[1] - delta],
                    [last[0] - delta, last[1] - delta],
                    [last[0] - delta, last[1] + delta]
                ]);
                break;
            case "roundanchor":
                delta *= 2;
                let radiusDelta = Math.PI / 18;
                let coordinates = [];
                let radius = 0;
                for (let i = 0; i < 36; i++) {
                    coordinates.push([
                        Math.cos(radius) * delta + last[0],
                        Math.sin(radius) * delta + last[1]
                    ]);
                    radius += radiusDelta;
                }
                coordinates.push(coordinates[0]);
                linearRing = new LinearRing(coordinates);
                break;
            case "diamondanchor":
                delta *= 1.5;
                linearRing = new LinearRing([
                    [last[0] - delta, last[1] + delta],
                    [last[0] + delta, last[1] + delta],
                    [last[0] + delta, last[1] - delta],
                    [last[0] - delta, last[1] - delta],
                    [last[0] - delta, last[1] + delta]
                ]);
                linearRing.rotate(Math.PI / 4, last);
                break;
            case "arrowanchor":
                delta *= 2;
                linearRing = new LinearRing([
                    [last[0], last[1] + delta],
                    [last[0] + delta * Math.cos(Math.PI / 6) * 2, last[1]],
                    [last[0], last[1] - delta],
                    [last[0], last[1] + delta]
                ]);
                break;
        }
        if (first[0] === last[0]) {
            if (first[1] > last[1]) {
                linearRing.rotate(-Math.PI / 2, last);
                linearRing.translate(0, -translateDelta);
            } else {
                linearRing.rotate(Math.PI / 2, last);
                linearRing.translate(0, translateDelta);
            }
        } else if (first[1] === last[1]) {
            if (last[0] < first[0]) {
                linearRing.rotate(Math.PI, last);
                linearRing.translate(-translateDelta, 0);
            } else {
                linearRing.translate(translateDelta, 0);
            }
        } else {
            let dx = last[0] - first[0];
            let dy = last[1] - first[1];
            let radians = Math.atan(dy / dx);
            if (last[0] > first[0]) {
                linearRing.rotate(radians, last);
                linearRing.translate(
                    Math.cos(radians) * translateDelta,
                    Math.sin(radians) * translateDelta
                );
            } else {
                linearRing.rotate(radians + Math.PI, last);
                linearRing.translate(
                    -Math.cos(radians) * translateDelta,
                    -Math.sin(radians) * translateDelta
                );
            }
        }

        let polygon = new Polygon([]);
        polygon.appendLinearRing(linearRing);
        multiPolygon.appendPolygon(polygon);
    }
    return multiPolygon;
}

export default GeoLineStyle;