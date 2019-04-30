import { GeoFilter } from "./geoFilter";
import { GeoFilterItem } from "./geoFilterItem";

export class GeoRegexFilter extends GeoFilter {
    regex: RegExp;

    constructor(filterItems: GeoFilterItem[]) {
        super(filterItems);
    }

    initializeCore() {
        let value = this.filterItems[0].value;
        value = value.slice(2, value.length - 1);
        this.regex = new RegExp(value, "g");

        this.key = this.filterItems[0].key;
    }

    matchFeatureCore(feature: any, zoom: number): boolean {
        let currentValue;
        if (this.replacedValueToIndex) {
            currentValue = feature.properties[this.key];
        }
        else {
            currentValue = feature.properties[this.key];
        }

        if (!currentValue) {
            return false;
        }

        return currentValue.toString().match(this.regex) !== null;
    }

    replaceVaulesToPbfIndexCore(pbfLayer) {
        this.replacedValueToIndex = true;
    }
}
