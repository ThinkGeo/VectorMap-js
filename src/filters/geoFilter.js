import GeoFilterItem from "./geoFilterItem";

class GeoFilter {


    constructor(filterItems) {
        this.filterItems = filterItems || [];
        this.replacedValueToIndex = false;
    }

    addFilterItem(filterItem) {
        this.filterItems.push(filterItem);
    }

    initialize() {
        this.initializeCore();
        this.initialized = true;
    }

    initializeCore() { }

    matchOLFeature(feature, zoom) {
        if (!this.initialized) {
            this.initialize();
        }
        return this.matchFeatureCore(feature, zoom);
    }

    replaceVaulesToPbfIndex(pbfLayer) {
        this.replaceVaulesToPbfIndexCore(pbfLayer);
    }

    matchFeatureCore(feature, zoom) { };
    replaceVaulesToPbfIndexCore(pbfLayer) { };
}

export default GeoFilter;