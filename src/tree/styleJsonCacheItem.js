import GeoZoomFilter from '../filters/geoZoomFilter';
import GeoRegexFilter from '../filters/geoRegexFilter';
import GeoFilterItem from '../filters/geoFilterItem';
import GeoNumberAttributeFilter from '../filters/GeoNumberAttributeFilter';
import GeoStringAttributeFilter from '../filters/geoStringAttributeFilter';

import GeoAreaStyle from '../style/geoAreaStyle';
import GeoLineStyle from '../style/geoLineStyle';
import GeoPointStyle from '../style/geoPointStyle';
import GeoTextStyle from '../style/geoTextStyle';
import GeoShieldStyle from '../style/geoShieldStyle';

class StyleJsonCacheItem {
    constructor(styleJson, minZoom, maxZoom, dataLayerColumnName,styleIdIndex) {
        this.childrenGeoStyles = [];
        this.subStyleCacheItems = [];
        this.minZoom = minZoom;
        this.maxZoom = maxZoom;
        this.zIndex = styleJson["z-index"];
        this.styleFirst = styleJson["style-first"];
        this.filterGroup = this.createFilters(styleJson.filter, dataLayerColumnName) || [];
        this.createSubItems(styleJson, dataLayerColumnName,styleIdIndex);
        this.geoStyle = this.createGeoStyle(styleJson);
        this.geoStyle && (this.geoStyle['zIndex'] = styleIdIndex);
        this.createChildrenGeoStyle(styleJson);
    }

    createFilters(filterString, dataLayerColumnName) {
        let filterGroup = [];
        let tempMinZoom = this.maxZoom;
        let tempMaxZoom = this.minZoom;
        if (filterString) {
            let filterStrings = filterString.split("|");
            for (let i = 0; i < filterStrings.length; i++) {
                let filterStr = filterStrings[i];
                let expression = "(\\w+?=~'.+?')|(\\w+?[<>!=]*'[^;]+?')|(\\w+?[<>!=]*[^;]+)";
                let regex = new RegExp(expression, "g");
                let results = filterStr.match(regex);
                let rangeFilters = {};
                let filters = [];

                let geoZoomFilter
                let dataLayerNameFilter

                for (let i = 0; i < results.length; i++) {
                    if (results[i]) {
                        let filterItem = GeoFilterItem["createFilterItem"](results[i]);

                        if (filterItem.value.indexOf("~'") === 0) {
                            filters.push(new GeoRegexFilter([filterItem]));
                        } else if (filterItem.key === "zoom") {
                            if (geoZoomFilter === undefined) {
                                geoZoomFilter = new GeoZoomFilter([]);
                            }
                            geoZoomFilter.addFilterItem(filterItem);
                        } else if (filterItem.value.includes("'")) {

                            if (filterItem.key === dataLayerColumnName) {
                                if (dataLayerNameFilter === undefined) {
                                    dataLayerNameFilter = new GeoStringAttributeFilter([filterItem]);
                                }
                            }
                            else {
                                filters.push(new GeoStringAttributeFilter([filterItem]));
                            }
                        } else {
                            rangeFilters[filterItem.key] = rangeFilters[filterItem.key] || new GeoNumberAttributeFilter([]);
                            rangeFilters[filterItem.key].addFilterItem(filterItem);
                        }
                    }
                }

                // update the minZoom and maxZoom by ZoomFilter
                if (geoZoomFilter) {
                    filters.push(geoZoomFilter);
                    geoZoomFilter.initialize();
                    if (geoZoomFilter.ranges.length > 0) {
                        let minZ = +geoZoomFilter.ranges[0][0];
                        let maxZ = +geoZoomFilter.ranges[0][1];
                        if (minZ <= tempMinZoom) {
                            tempMinZoom = minZ;
                        }
                        if (maxZ >= tempMaxZoom) {
                            tempMaxZoom = maxZ;
                        }
                    }
                    else {
                        let z = +geoZoomFilter.allowedValues[0];
                        if (z <= tempMinZoom) {
                            tempMinZoom = z;
                        }
                        if (z >= tempMaxZoom) {
                            tempMaxZoom = z;
                        }
                    }
                }
                // update the dataLayerName
                if (dataLayerNameFilter) {
                    dataLayerNameFilter.initialize();
                    this.dataLayerName = dataLayerNameFilter.expectedValues[0];
                }
                for (let name in rangeFilters) {
                    filters.push(rangeFilters[name]);
                }
                filterGroup.push(filters);
            }
        }
        if (tempMaxZoom !== this.minZoom || tempMinZoom !== this.maxZoom) {
            this.maxZoom = tempMaxZoom;
            this.minZoom = tempMinZoom;
        }
        return filterGroup;
    }

    createSubItems(styleJson, dataLayerColumnName,styleIdIndex) {
        if (styleJson.style) {
            // apply the property to sub style.
            for (let key in styleJson) {
                if (key !== "style" && key !== "filter") {
                    for (let i = 0; i < styleJson.style.length; i++) {
                        // Apply the property to sub style if the sub style does not included.
                        if (styleJson.style[i][key] === undefined) {
                            if (key === "id") {
                                styleJson.style[i][key] = styleJson[key] + "#" + i;
                            } else {
                                styleJson.style[i][key] = styleJson[key];
                            }
                        }
                    }
                }
            }
            let subItemMinZoom;
            let subItemMaxZoom;
            for (let subStyle of styleJson.style) {
                let styleJsonCacheSubItem = new StyleJsonCacheItem(subStyle, this.minZoom, this.maxZoom, dataLayerColumnName,styleIdIndex);

                if (subItemMaxZoom === undefined || styleJsonCacheSubItem.maxZoom > subItemMaxZoom) {
                    subItemMaxZoom = styleJsonCacheSubItem.maxZoom;
                }
                if (subItemMinZoom === undefined || styleJsonCacheSubItem.minZoom < subItemMinZoom) {
                    subItemMinZoom = styleJsonCacheSubItem.minZoom;
                }

                this.subStyleCacheItems.push(styleJsonCacheSubItem);
            }
            if (subItemMinZoom && subItemMinZoom > this.minZoom) {
                this.minZoom = subItemMinZoom;
            }
            if (subItemMaxZoom && subItemMaxZoom < this.maxZoom) {
                this.maxZoom = subItemMaxZoom;
            }
        }
    }

    createGeoStyle(styleJson) {
        let geoStyle;
        for (let key in styleJson) {
            if (key !== "style" && key !== "filter") {
                let keys = key.split("-");
                if (keys.length > 1) {
                    switch (keys[0]) {
                        case "polygon":
                            geoStyle = new GeoAreaStyle(styleJson);
                            break;
                        case "line":
                            geoStyle = new GeoLineStyle(styleJson);
                            break;
                        case "text":
                            geoStyle = new GeoTextStyle(styleJson);
                            break;
                        case "point":
                            geoStyle = new GeoPointStyle(styleJson);
                            break;
                        case "shield":
                            geoStyle = new GeoShieldStyle(styleJson);
                            break;
                        default:
                            break;
                    }
                    break;
                }
            }
        }
        return geoStyle;
    }
    createChildrenGeoStyle(styleJson) {
        if (styleJson["children"]) {
            for (let i = 0; i < styleJson["children"].length; i++) {
                let childrenGeoStyleJson = styleJson["children"][i];
                if (childrenGeoStyleJson["id"] === undefined) {
                    childrenGeoStyleJson["id"] = styleJson["id"] + "#c" + i;
                }
                this.childrenGeoStyles.push(this.createGeoStyle(childrenGeoStyleJson));
            }
        }
    }
}

export default StyleJsonCacheItem;