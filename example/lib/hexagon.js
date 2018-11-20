ol.source.HexBin = function(options) {
    options = options || {};
    // bind function for callback
    this._bind = {
        modify: this._onModifyFeature.bind(this)
    };
    ol.source.Vector.call(this, options);
    // The HexGrid
    this._hexgrid = new ol.HexGrid(options);
    this._bin = {};
    // Source and origin
    this._origin = options.source;
    // Geometry function to get a point
    this._geomFn = options.geometryFunction || ol.coordinate.getFeatureCenter || function(f) {
        return f.getGeometry().getFirstCoordinate();
    };
    // Existing features
    this.reset();
    // Future features
    this._origin.on("addfeature", this._onAddFeature.bind(this));
    this._origin.on("removefeature", this._onRemoveFeature.bind(this));
};
ol.inherits(ol.source.HexBin, ol.source.Vector);
/**
 * On add feature
 * @param {ol.Event} e 
 * @private
 */
ol.source.HexBin.prototype._onAddFeature = function(e) {
    var f = e.feature || e.target;
    var h = this._hexgrid.coord2hex(this._geomFn(f));
    var id = h.toString();
    if (this._bin[id]) {
        this._bin[id].get('features').push(f);
    } else {
        var ex = new ol.Feature(new ol.geom.Polygon([this._hexgrid.getHexagon(h)]));
        ex.set('features', [f]);
        ex.set('center', new ol.geom.Point(ol.extent.getCenter(ex.getGeometry().getExtent())));
        this._bin[id] = ex;
        this.addFeature(ex);
    }
    f.on("change", this._bind.modify);
};
/**
 * Get the hexagon of a feature
 * @param {ol.Feature} f 
 * @return {} the bin id, the index of the feature in the bin and a boolean if the feature has moved to an other bin
 */
ol.source.HexBin.prototype.getBin = function(f) {
    // Test if feature exists in the current hex
    var id = this._hexgrid.coord2hex(this._geomFn(f)).toString();
    if (this._bin[id]) {
        var index = this._bin[id].get('features').indexOf(f);
        if (index > -1) return {
            id: id,
            index: index
        };
    }
    // The feature has moved > check all bins
    for (id in this._bin) {
        var index = this._bin[id].get('features').indexOf(f);
        if (index > -1) return {
            id: id,
            index: index,
            moved: true
        };
    }
    return false;
};
/**
 * On remove feature
 * @param {ol.Event} e 
 * @param {*} bin 
 * @private
 */
ol.source.HexBin.prototype._onRemoveFeature = function(e, bin) {
    var f = e.feature || e.target;
    var b = bin || this.getBin(f);
    if (b) {
        var features = this._bin[b.id].get('features');
        features.splice(b.index, 1);
        if (!features.length) {
            this.removeFeature(this._bin[b.id]);
            delete this._bin[b.id];
        }
    } else {
        console.log("[ERROR:HexBin] remove feature feature doesn't exists anymore.");
    }
    f.un("change", this._bind.modify);
};
/**
 * A feature has been modified
 * @param {ol.Event} e 
 * @private
 */
ol.source.HexBin.prototype._onModifyFeature = function(e) {
    var bin = this.getBin(e.target);
    if (bin && bin.moved) {
        // remove from the bin
        this._onRemoveFeature(e, bin);
        // insert in the new bin
        this._onAddFeature(e);
    }
    this.changed();
};
/** Clear all bins and generate a new one
 */
ol.source.HexBin.prototype.reset = function() {
    this._bin = {};
    this.clear();
    var features = this._origin.getFeatures();
    for (var i = 0, f; f = features[i]; i++) {
        this._onAddFeature({
            feature: f
        });
    };
};
/**
 * Get the orginal source 
 * @return {ol.source.Vector}
 */
ol.source.HexBin.prototype.getSource = function() {
    return this._origin;
};
ol.HexGrid = function(options) {
    options = options || {};
    ol.Object.call(this, options);
    // Options
    this.size_ = options.size || 80000;
    this.origin_ = options.origin || [0, 0];
    this.layout_ = this.layout[options.layout] || this.layout.pointy;
};
ol.inherits(ol.HexGrid, ol.Object);
/** Layout
 */
ol.HexGrid.prototype.layout = {
    pointy: [Math.sqrt(3), Math.sqrt(3) / 2, 0, 3 / 2,
        Math.sqrt(3) / 3, -1 / 3, 0, 2 / 3,
        // corners
        Math.cos(Math.PI / 180 * (60 * 0 + 30)), Math.sin(Math.PI / 180 * (60 * 0 + 30)),
        Math.cos(Math.PI / 180 * (60 * 1 + 30)), Math.sin(Math.PI / 180 * (60 * 1 + 30)),
        Math.cos(Math.PI / 180 * (60 * 2 + 30)), Math.sin(Math.PI / 180 * (60 * 2 + 30)),
        Math.cos(Math.PI / 180 * (60 * 3 + 30)), Math.sin(Math.PI / 180 * (60 * 3 + 30)),
        Math.cos(Math.PI / 180 * (60 * 4 + 30)), Math.sin(Math.PI / 180 * (60 * 4 + 30)),
        Math.cos(Math.PI / 180 * (60 * 5 + 30)), Math.sin(Math.PI / 180 * (60 * 5 + 30))
    ],
    flat: [3 / 2, 0, Math.sqrt(3) / 2, Math.sqrt(3), 2 / 3,
        0, -1 / 3, Math.sqrt(3) / 3,
        // corners
        Math.cos(Math.PI / 180 * (60 * 0)), Math.sin(Math.PI / 180 * (60 * 0)),
        Math.cos(Math.PI / 180 * (60 * 1)), Math.sin(Math.PI / 180 * (60 * 1)),
        Math.cos(Math.PI / 180 * (60 * 2)), Math.sin(Math.PI / 180 * (60 * 2)),
        Math.cos(Math.PI / 180 * (60 * 3)), Math.sin(Math.PI / 180 * (60 * 3)),
        Math.cos(Math.PI / 180 * (60 * 4)), Math.sin(Math.PI / 180 * (60 * 4)),
        Math.cos(Math.PI / 180 * (60 * 5)), Math.sin(Math.PI / 180 * (60 * 5))
    ]
};
/** Set layout
 * @param {pointy | flat | undefined} layout name, default pointy
 */
ol.HexGrid.prototype.setLayout = function(layout) {
        this.layout_ = this.layout[layout] || this.layout.pointy;
        this.changed();
    }
    /** Get layout
     * @return {pointy | flat} layout name
     */
ol.HexGrid.prototype.getLayout = function() {
        return (this.layout_[9] != 0 ? 'pointy' : 'flat');
    }
    /** Set hexagon origin
     * @param {ol.coordinate} coord origin
     */
ol.HexGrid.prototype.setOrigin = function(coord) {
        this.origin_ = coord;
        this.changed();
    }
    /** Get hexagon origin
     * @return {ol.coordinate} coord origin
     */
ol.HexGrid.prototype.getOrigin = function(coord) {
        return this.origin_;
    }
    /** Set hexagon size
     * @param {Number} hexagon size
     */
ol.HexGrid.prototype.setSize = function(s) {
        this.size_ = s || 80000;
        this.changed();
    }
    /** Get hexagon size
     * @return {Number} hexagon size
     */
ol.HexGrid.prototype.getSize = function(s) {
        return this.size_;
    }
    /** Convert cube to axial coords
     * @param {ol.coordinate} c cube coordinate
     * @return {ol.coordinate} axial coordinate
     */
ol.HexGrid.prototype.cube2hex = function(c) {
    return [c[0], c[2]];
};
/** Convert axial to cube coords
 * @param {ol.coordinate} h axial coordinate
 * @return {ol.coordinate} cube coordinate
 */
ol.HexGrid.prototype.hex2cube = function(h) {
    return [h[0], -h[0] - h[1], h[1]];
};
ol.HexGrid.prototype.cube_round = function(h) {
    var rx = Math.round(h[0])
    var ry = Math.round(h[1])
    var rz = Math.round(h[2])
    var x_diff = Math.abs(rx - h[0])
    var y_diff = Math.abs(ry - h[1])
    var z_diff = Math.abs(rz - h[2])
    if (x_diff > y_diff && x_diff > z_diff) rx = -ry - rz
    else if (y_diff > z_diff) ry = -rx - rz
    else rz = -rx - ry
    return [rx, ry, rz];
};
/** Round axial coords
 * @param {ol.coordinate} h axial coordinate
 * @return {ol.coordinate} rounded axial coordinate
 */
ol.HexGrid.prototype.hex_round = function(h) {
    return this.cube2hex(this.cube_round(this.hex2cube(h)));
};
/** Get hexagon corners
 */
ol.HexGrid.prototype.hex_corner = function(center, size, i) {
    return [center[0] + size * this.layout_[8 + (2 * (i % 6))], center[1] + size * this.layout_[9 + (2 * (i % 6))]];
};

/** Get hexagon coordinates at hex
 * @param {ol.coord} hex
 * @return {Arrary<ol.coord>}
 */
ol.HexGrid.prototype.getHexagon = function(hex) {
    var p = [];
    var c = this.hex2coord(hex);
    for (var i = 0; i <= 7; i++) {
        p.push(this.hex_corner(c, this.size_, i, this.layout_[8]));
    }
    return p;
};
/** Convert hex to coord
 * @param {ol.hex} hex 
 * @return {ol.coord} 
 */
ol.HexGrid.prototype.hex2coord = function(hex) {
    return [
        this.origin_[0] + this.size_ * (this.layout_[0] * hex[0] + this.layout_[1] * hex[1]),
        this.origin_[1] + this.size_ * (this.layout_[2] * hex[0] + this.layout_[3] * hex[1])
    ];
};
/** Convert coord to hex
 * @param {ol.coord} coord 
 * @return {ol.hex} 
 */
ol.HexGrid.prototype.coord2hex = function(coord) {
    var c = [(coord[0] - this.origin_[0]) / this.size_, (coord[1] - this.origin_[1]) / this.size_];
    var q = this.layout_[4] * c[0] + this.layout_[5] * c[1];
    var r = this.layout_[6] * c[0] + this.layout_[7] * c[1];
    return this.hex_round([q, r]);
};