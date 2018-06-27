import { GeoFilter } from "./geoFilter";
import { GeoFilterItem } from "./geoFilterItem";

export class GeoStringAttributeFilter extends GeoFilter {
    expectedValues: string[];
    expectedValueIndexs: number[];

    constructor(filterItems: GeoFilterItem[]) {
        super(filterItems);
    }

    initializeCore() {
        let expectedValue = this.filterItems[0].value;
        expectedValue = expectedValue.slice(1, expectedValue.length - 1);
        this.expectedValues = expectedValue.split(",");
        this.key = this.filterItems[0].key;
    }

    matchFeatureCore(feature: any, zoom: number): boolean {
        let currentValue;
        let currentExpectedValues;
        if (this.replacedValueToIndex) {
            currentValue = feature.propertiesIndex[this.keyIndex];
            currentExpectedValues = this.expectedValueIndexs;
        }
        else {
            currentValue = feature.properties[this.key];
            currentExpectedValues = this.expectedValues;
        }

        switch (this.filterItems[0].operator) {
            case "=":
                return currentExpectedValues.includes(currentValue);
            case "!=":
            default:
                return !currentExpectedValues.includes(currentValue);
        }
    }

    replaceVaulesToPbfIndexCore(pbfLayer) {
        if (!this.initialized) {
            this.initialize();
        }

        this.keyIndex = pbfLayer.keys.indexOf(this.key);

        let replacedExpectedVaules = [];
        for (let j = 0, jj = this.expectedValues.length; j < jj; j++) {
            let numberValue = +this.expectedValues[j];
            if (isNaN(numberValue)) {
                replacedExpectedVaules.push(pbfLayer.values.indexOf(this.expectedValues[j]));
            }
            else {
                replacedExpectedVaules.push(pbfLayer.values.indexOf(numberValue));
            }
        }

        this.expectedValueIndexs = replacedExpectedVaules;
        this.replacedValueToIndex = true;
    }
}