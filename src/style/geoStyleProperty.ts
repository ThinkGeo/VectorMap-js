import { GeoFilterItem } from "../filter/geoFilterItem";
import { GeoZoomFilter } from "../filter/geoZoomFilter";
import { GeoStringAttributeFilter } from "../filter/geoStringAttributeFilter";
import { GeoRegexFilter } from "../filter/geoRegexFilter";
import { GeoNumberAttributeFilter } from "../filter/geoNumberAttributeFilter";

export class GeoStyleProperty {
    public styleJsonValue: any;
    public defaultValue: any;

    public value: any;
    public conditions: any;
    public values: any;

    constructor(styleJsonValue, defaultValue?) {
        this.styleJsonValue = styleJsonValue;
        this.defaultValue = defaultValue;
    }

    public initialize() {
        if (this.styleJsonValue !== undefined) {
            if (typeof this.styleJsonValue === "object") {
                this.conditions = [];
                this.values = [];
                for (let name in this.styleJsonValue) {
                    let filters = this.createFilter(name);
                    this.conditions.push(filters);
                    this.values.push(this.initializeValue(this.styleJsonValue[name]));
                }
            }
        }
        this.value = this.initializeValue(this.defaultValue);
    }

    public initializeValue(value) {
        return value;
    }

    public isCondition() {
        return this.conditions && this.conditions.length > 0;
    }

    public getValue(columnValue?) {
        if (this.conditions && this.conditions.length > 0) {
            if (columnValue) {
                let i = 0;
                let matched = false;
                for (i = 0; i < this.conditions.length; i++) {
                    let filterGroup = this.conditions[i];
                    for (let j = 0; j < filterGroup.length; j++) {
                        let filters = filterGroup[j];
                        let groupMatched = true;
                        for (let k = 0; k < filters.length; k++) {
                            let filter = filters[k];
                            let rawFeature = { properties: columnValue };
                            if (!filter.matchOLFeature(rawFeature, 0)) {
                                groupMatched = false;
                                break;
                            }
                        }
                        if (groupMatched) {
                            matched = true;
                            break;
                        }
                    }
                    if (matched) {
                        break;
                    }
                }
                if (matched) {
                    return this.values[i];
                }
            }
            else {
                return this.value;
            }

        }
        else {
            return this.value;
        }
    }

    public createFilter(filterString) {
        let filterGroup = [];
        if (filterString) {
            let filterStrings = filterString.split("|");
            for (let i = 0; i < filterStrings.length; i++) {
                let filterStr = filterStrings[i];
                let expression = "(\\w+?=~'.+?')|(\\w+?[<>!=]*'[^;]+?')|(\\w+?[<>!=]*[^;]+)";
                let regex = new RegExp(expression, "g");
                let results = filterStr.match(regex);
                let rangeFilters = {};
                let filters = [];

                let geoZoomFilter: GeoZoomFilter;

                for (let i = 0; i < results.length; i++) {
                    if (results[i]) {
                        let filterItem = GeoFilterItem.createFilterItem(results[i]);

                        if (filterItem.value.startsWith("~'")) {
                            filters.push(new GeoRegexFilter([filterItem]));
                        } else if (filterItem.key === "zoom") {
                            if (geoZoomFilter === undefined) {
                                geoZoomFilter = new GeoZoomFilter([]);
                            }
                            geoZoomFilter.addFilterItem(filterItem);
                        } else if (filterItem.value.includes("'")) {
                            filters.push(new GeoStringAttributeFilter([filterItem]));
                        } else {
                            rangeFilters[filterItem.key] = rangeFilters[filterItem.key] || new GeoNumberAttributeFilter([]);
                            rangeFilters[filterItem.key].addFilterItem(filterItem);
                        }
                    }
                }
                for (let name in rangeFilters) {
                    filters.push(rangeFilters[name]);
                }
                filterGroup.push(filters);
            }
        }
        return filterGroup;
    }
}
