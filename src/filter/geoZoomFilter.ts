import { GeoFilter } from "./geoFilter";
import { GeoFilterItem } from "./geoFilterItem";
import { GeoRangeFilter } from "./geoRangeFilter";

export class GeoZoomFilter extends GeoRangeFilter {
    constructor(filterItems: GeoFilterItem[]) {
        super(filterItems);
    }

    matchFeatureCore(feature: ol.Feature, zoom: number): boolean {
        return this.isInRange(zoom);
    }

    replaceVaulesToPbfIndexCore(pbfLayer) {
        this.replacedValueToIndex = true;
    }
}
