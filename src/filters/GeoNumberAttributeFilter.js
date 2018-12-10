import GeoFilterItem from "./geoFilterItem";
import GeoRangeFilter from "./geoRangeFilter";

class GeoNumberAttributeFilter extends GeoRangeFilter {
    constructor(filterItems) {
        super(filterItems);
    }
}

export default GeoNumberAttributeFilter;
