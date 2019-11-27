import { GeoFilter } from "./geoFilter";
import { GeoFilterItem } from "./geoFilterItem";

export abstract class GeoRangeFilter extends GeoFilter {
    public ranges: Number[][] = [];
    public allowedValues: Number[] = [];
    public disallowedValues: Number[] = [];

    constructor(filterItems: GeoFilterItem[]) {
        super(filterItems);
    }

    initializeCore() {
        this.filterItems.sort((a, b) => +a.value - +b.value);
        for (let i = 0; i < this.filterItems.length; i++) {
            let filterItem = this.filterItems[i];
            this.key = filterItem.key;
            let value = +filterItem.value;
            switch (filterItem.operator) {
                case "!=":
                    this.disallowedValues.push(value);
                    break;
                case "=":
                    this.allowedValues.push(value);
                    break;
            }
        }
    }

    matchFeatureCore(feature: any, zoom: number): boolean {
        let currentValue;
        if (this.replacedValueToIndex) {
            currentValue = feature.getProperties()[this.key];
        }
        else {
            currentValue = feature.getProperties()[this.key];
        }

        return this.isInRange(+currentValue);
    }

    replaceVaulesToPbfIndexCore(pbfLayer) {
        this.replacedValueToIndex = true;
    }

    isInRange(currentValue: any): boolean {
        if (this.disallowedValues.includes(currentValue)) {
            return false;
        }
        if (this.allowedValues.includes(currentValue)) {
            return true;
        }

        for (var i = 0; i < this.filterItems.length; i++) {
            var filterItem = this.filterItems[i];
            var value = +filterItem.value;
            switch (filterItem.operator) {
                case ">":
                    if (!(currentValue > value)) {
                        return false;
                    }
                    break;
                case ">=":
                    if (!(currentValue >= value)) {
                        return false;
                    }
                    break;
                case "<":
                    if (!(currentValue < value)) {
                        return false;
                    }
                    break;
                case "<=":
                    if (!(currentValue <= value)) {
                        return false;
                    }
                    break;
                case "=":
                    if (!(currentValue === value)) {
                        return false;
                    }
                    break;
                case "!=":
                    if (!(currentValue !== value)) {
                        return false;
                    }
                    break;
                default:
                    break;
            }
        }
        return true;
    }

    private static getRange(ranges: Number[][], value: number): Number[] {
        for (let i = 0; i < ranges.length; i++) {
            let range = ranges[i];
            if (value >= range[0] && value <= range[1]) {
                return range;
            }
        }
        return null;
    }
}

