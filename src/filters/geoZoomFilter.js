import GeoFilter from "./geoFilter";
import GeoFilterItem from "./geoFilterItem";
import GeoRangeFilter from "./geoRangeFilter";

class GeoZoomFilter extends GeoRangeFilter {
    constructor(filterItems) {
        super(filterItems);
    }

    matchFeatureCore(feature, zoom) {
        return this.isInRange(zoom);
    }

    replaceVaulesToPbfIndexCore(pbfLayer) {
        this.replacedValueToIndex = true;
    }
}
export default GeoZoomFilter;
