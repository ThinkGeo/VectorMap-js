import { GeoFilterItem } from "./geoFilterItem";
import { GeoRangeFilter } from "./geoRangeFilter";

export class GeoNumberAttributeFilter extends GeoRangeFilter {
    constructor(filterItems: GeoFilterItem[]) {
        super(filterItems);
    }
}
