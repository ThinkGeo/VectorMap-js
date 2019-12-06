import { GeoStyle } from "./geoStyle";

export class GeoLineStyle extends GeoStyle {
    geometryLineCaps = [
        "triangle",
        "squareanchor",
        "roundanchor",
        "diamondanchor",
        "arrowanchor"
    ];
    olLineCapsMap = {
        butt: "butt",
        flat: "square",
        square: "square",
        round: "round",
        noanchor: "square",
        anchormask: "square",
        custom: "square"
    };

    olLineJoinsMap = {
        bevel: "bevel",
        round: "round",
        miter: "miter",
        round: "round",
        default: "round",
        miterclipped: "miter",
        custom: "square"
    };

    compounds = ['overlay', 'reject'];
    defaultCompund = 'overlay';

    lineCap: string;
    color: string;
    dashArray: any;
    geometryTransform: string;
    lineJoin: string;
    miterLimit: number;
    opacity: number;
    width: number;
    lineDirectionImageUri: any;

    olColor: string;
    convertedDashArray: number[] = new Array<number>();


    lineStroke: any;
    lineStyle: any;

    lineCapFill: any;
    lineCapStyle: any;

    onewayIcon: any;
    onewayStyle: any;

    static onewayImg: any;

    constructor(styleJson?: any) {
        super(styleJson);
        if (styleJson) {
            this.compound = styleJson["line-compound"];
            this.color = styleJson["line-color"];
            this.dashArray = styleJson["line-dasharray"];
            this.width = styleJson["line-width"];
            this.miterLimit = styleJson["line-miterlimit"];
            this.lineJoin = styleJson["line-join"];
            this.lineCap = styleJson["line-cap"];
            this.opacity = styleJson["line-opacity"];
            this.offsetX = styleJson["line-offset-x"] || 0;
            this.offsetY = styleJson["line-offset-y"] || 0;
            this.geometryTransform = styleJson["line-geometry-transform"];
            this.lineDirectionImageUri = styleJson["line-direction-image-uri"];
            this.lineDirectionImageSize = styleJson["line-direction-image-size"];
        }
        if (!this.compounds.includes(this.compound)) {
            this.compound = this.defaultCompund;
        }
    }

    initializeCore() {
        this.lineStroke = new ol.style.Stroke();
        this.lineStyle = new ol.style.Style({ stroke: this.lineStroke });
        this.lineCapFill = new ol.style.Fill();
        this.lineCapStyle = new ol.style.Style({ fill: this.lineCapFill });

        if (this.color) {
            this.olColor = GeoStyle.blendColorAndOpacity(this.color, this.opacity);

            this.lineStroke.setColor(this.olColor);
            this.lineCapFill.setColor(this.olColor);
        }
        if (this.dashArray) {
            let tmpArray = this.dashArray.split(",");
            for (let a of tmpArray) {
                this.convertedDashArray.push(parseFloat(a));
            }
        }
        if (this.lineCap) {
            this.lineCap = this.lineCap.toLowerCase();
        }
        if (this.lineJoin) {
            this.lineJoin = this.lineJoin.toLowerCase();
        }

        if (this.lineDirectionImageUri) {
            var imageSize;
            if(this.lineDirectionImageSize!=undefined)
            {
                var imageSizeArray=this.lineDirectionImageSize.split(",");
                if(imageSizeArray.length===1)
                {
                    var size = +imageSizeArray[0];
                    if(!isNaN(size))
                    {
                        imageSize=[size,size];
                    }

                }else if(imageSizeArray.length ===2)
                {
                    var imgWidth = +imageSizeArray[0];
                    var imgHeitht = +imageSizeArray[1];
                    if(!isNaN(imgWidth)&&!isNaN(imgHeitht))
                    {
                        imageSize=[imgWidth,imgHeitht];
                    }
                }
            }

            this.onewayIcon = new ol.style.Icon({
                src: this.lineDirectionImageUri,
                imgSize: imageSize,
                anchor: [0.5, 0.5],
                rotateWithView: true
            });

            this.onewayStyle = new ol.style.Style({
                image: this.onewayIcon
            });
            this.onewayStyle['zCoordinate'] = this.zIndex;
        }
    }

    getTransformValues(transform: string): any {
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

    getConvertedStyleCore(feature: any, resolution: number, options: any): ol.style.Style[] {
        var styles = [];
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
                this.lineStroke.setLineJoin(this.olLineJoinsMap[this.lineJoin.toLowerCase()]);
            }
            if (this.miterLimit !== 4) {
                this.lineStroke.setMiterLimit(this.miterLimit);
            }
            if (this.width) {
                this.lineStroke.setWidth(this.width);
            }

            let geometryFunction = (feature) => {
                if (this.geometryTransform) {
                    let geometry = this.getGeometry(feature);
                    if (this.geometryTransform) {
                        let values = this.getTransformValues(this.geometryTransform);

                        if (this.geometryTransform.indexOf("translate") === 0) {
                            var dx = values[0].trim();
                            var dy = values[1].trim();
                            geometry.translate(+dx, +dy);
                            var newExtent_ = (<any>ol.geom).flat.transform.translate(feature.extent_, 0, feature.extent_.length, 2, -dx, -dy);
                            geometry['extent_'] = newExtent_;
                        } else if (this.geometryTransform.indexOf("scale") === 0) {
                            geometry.scale(+values[0].trim(), +values[1].trim());
                        } else if (this.geometryTransform.indexOf("rotate") === 0) {
                            let center = ol.extent.getCenter(geometry.getExtent());
                            let angle = +values[0].trim() * Math.PI / 180;
                            geometry.rotate(angle, center);
                        } else if (this.geometryTransform.indexOf("skew") === 0) {
                            this.skewGeometry(geometry, +values[0].trim(), +values[1].trim());
                        }

                        feature.flatCoordinates_ = (<any>geometry).getFlatCoordinates();
                    }
                    if (this.offsetX || this.offsetY) {
                        var geometry = this.getGeometry(feature);
                        var dx = this.offsetX * resolution;
                        var dy = this.offsetY * resolution;
                        geometry.translate(+dx, +dy);
                        var newExtent_ = ol.geom.flat.transform.translate(feature.extent_, 0, feature.extent_.length, 2, -dx, -dy);
                        geometry.extent_ = newExtent_;
                        feature.flatCoordinates_ = geometry.getFlatCoordinates();
                    }
                }
                return feature.getGeometry();
            };

            this.lineStyle.setGeometry(geometryFunction);
            this.lineCapStyle.zCoordinate = this.zIndex;
            styles.push(this.lineStyle);

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
                this.lineCapStyle.zCoordinate = this.zIndex + 0.1;
                styles.push(this.lineCapStyle);
            }

        }

        if (this.lineDirectionImageUri) {
            let flatCoordinates = feature.getGeometry().getFlatCoordinates();
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
            let centerPoint: [number, number] = [(start[0] + end[0]) * 0.5, (start[1] + end[1]) * 0.5];
            let geometry = new ol.geom.Point(centerPoint, "XY");

            this.onewayIcon.rotation_ = -rotation;

            this.onewayStyle.setGeometry(geometry);
            this.lineCapStyle.zCoordinate = this.zIndex + 0.4;
            styles.push(this.onewayStyle);
        }

        return styles;
    }

    getGeometry(feature: any) {
        let tmpFlatCoordinates = feature.getGeometry().getFlatCoordinates();
        let tmpCoordinates: ol.Coordinate[] = [];
        for (let i = 0; i < tmpFlatCoordinates.length; i += 2) {
            tmpCoordinates.push([tmpFlatCoordinates[i], tmpFlatCoordinates[i + 1]]);
        }
        return new ol.geom.LineString(tmpCoordinates);
    }

    static createAnchoredGeometry(geometry: ol.geom.Geometry, lineCap: string, lineWidth: number, resolution: number) {
        let segments = GeoLineStyle.getTerminalSegments(geometry);
        let linearRing: ol.geom.LinearRing = undefined;
        let multiPolygon = new ol.geom.MultiPolygon([]);
        for (let segment of segments) {
            let first = segment[0];
            let last = segment[1];
            let delta = lineWidth * resolution / 2;
            let translateDelta = (lineWidth - 1) * resolution / 2;
            switch (lineCap) {
                case "triangle":
                    linearRing = new ol.geom.LinearRing([
                        [last[0], last[1] + delta],
                        [last[0] + delta, last[1]],
                        [last[0], last[1] - delta],
                        [last[0], last[1] + delta]
                    ]);
                    break;
                case "squareanchor":
                    delta *= 1.5;
                    linearRing = new ol.geom.LinearRing([
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
                    let coordinates: ol.Coordinate[] = [];
                    let radius = 0;
                    for (let i = 0; i < 36; i++) {
                        coordinates.push([
                            Math.cos(radius) * delta + last[0],
                            Math.sin(radius) * delta + last[1]
                        ]);
                        radius += radiusDelta;
                    }
                    coordinates.push(coordinates[0]);
                    linearRing = new ol.geom.LinearRing(coordinates);
                    break;
                case "diamondanchor":
                    delta *= 1.5;
                    linearRing = new ol.geom.LinearRing([
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
                    linearRing = new ol.geom.LinearRing([
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

            let polygon = new ol.geom.Polygon([]);
            polygon.appendLinearRing(linearRing);
            multiPolygon.appendPolygon(polygon);
        }
        return multiPolygon;
    }

    static getTerminalSegments(geometry: ol.geom.Geometry) {
        let type = geometry.getType();
        let results = [];
        let geometryType = (<any>ol.geom).GeometryType;
        switch (type) {
            case geometryType.LINE_STRING:
                let coords = (<any>geometry).getCoordinates();
                let start = [coords[1], coords[0]];
                let end = [coords[coords.length - 2], coords[coords.length - 1]];
                results.push(start);
                results.push(end);
                break;
            case geometryType.MULTI_LINE_STRING:
                let lines = (<any>geometry).getLineStrings();
                for (let line of lines) {
                    Array.prototype.push.apply(results, GeoLineStyle.getTerminalSegments(line));
                }
                break;
            case geometryType.GEOMETRY_COLLECTION:
                let geometries = (<any>geometry).getGeometries();
                for (let geom of geometries) {
                    Array.prototype.push.apply(results, GeoLineStyle.getTerminalSegments(geom));
                }
                break;
        }
        return results;
    }
}