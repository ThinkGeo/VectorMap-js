export class TilePyramid {
    tileCoord: any;
    extent: any;
    features: any;
    centerPoint: any;

    tileParamid0: TilePyramid;
    tileParamid1: TilePyramid;
    tileParamid2: TilePyramid;
    tileParamid3: TilePyramid;


    constructor(tileCoord, extent: any) {
        this.extent = extent;
        this.features = [];
        this.centerPoint = [(this.extent[0] + this.extent[3]) / 2, (this.extent[1] + this.extent[4]) / 2];
    }

    add(feature: any, tileCoord: any) {
        this.features.push(feature);
        if (tileCoord[0] !== this.tileCoord[0]) {
            let featureExtent = feature.getGeometry().getExtent();
            let z = this.tileCoord[0] + 1;
            let x = this.tileCoord[1] * 2;
            let y = this.tileCoord[2] * 2;
            let minX = this.extent[0];
            let minY = this.extent[1];
            let maxX = this.extent[2];
            let maxY = this.extent[3];

            if (ol.extent.intersects(featureExtent, this.tileParamid0.extent)) {
                if (this.tileParamid0 === undefined) {
                    this.tileParamid0 = new TilePyramid([z, x, y + 1], [minX, minY, this.centerPoint[0], this.centerPoint[1]]);
                }
                this.tileParamid0.add(feature, tileCoord);
            }
            if (ol.extent.intersects(featureExtent, this.tileParamid1.extent)) {
                if (this.tileParamid1 === undefined) {
                    this.tileParamid1 = new TilePyramid([z, x + 1, y], [this.centerPoint[0], minY, maxX, this.centerPoint[1]]);
                }
                this.tileParamid1.add(feature, tileCoord);
            }
            if (ol.extent.intersects(featureExtent, this.tileParamid2.extent)) {
                if (this.tileParamid2 === undefined) {
                    this.tileParamid2 = new TilePyramid([z, x + 1, y], [this.centerPoint[0], this.centerPoint[1], maxX, maxY]);
                }
                this.tileParamid2.add(feature, tileCoord);
            }
            if (ol.extent.intersects(featureExtent, this.tileParamid3.extent)) {
                if (this.tileParamid3 === undefined) {
                    this.tileParamid3 = new TilePyramid([z, x, y], [minX, this.centerPoint[1], this.centerPoint[0], maxY]);
                }
                this.tileParamid3.add(feature, tileCoord);
            }
        }
    }
}