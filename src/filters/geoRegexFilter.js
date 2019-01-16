import GeoFilter from "./geoFilter";
import GeoFilterItem from "./geoFilterItem";

class GeoRegexFilter extends GeoFilter {
    constructor(filterItems) {
        super(filterItems);
    }

    initializeCore() {
        let value = this.filterItems[0].value;
        value = value.slice(2, value.length - 1);
        this.regex = new RegExp(value, "g");
        this.key = this.filterItems[0].key;
    }

    matchFeatureCore(feature, zoom) {
        let currentValue;
        if (this.replacedValueToIndex && feature.propertiesIndex) {
            currentValue = feature.propertiesIndex[this.key];
        }
        else {
            if (feature.properties !== undefined) {
                currentValue = feature.properties[this.key];
            }
            else {
                currentValue = feature.get(this.key)
            }
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

export default GeoRegexFilter;