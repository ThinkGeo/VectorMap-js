import { GeoFilter } from "../filter/geoFilter";
import { GeoFilterItem } from "../filter/geoFilterItem";
import { GeoZoomFilter } from "../filter/geoZoomFilter";
import { GeoStringAttributeFilter } from "../filter/geoStringAttributeFilter";
import { GeoRegexFilter } from "../filter/geoRegexFilter";
import { GeoNumberAttributeFilter } from "../filter/geoNumberAttributeFilter";
import { GeoStyle } from "../style/geoStyle";
import { GeoAreaStyle } from "../style/geoAreaStyle";
import { GeoLineStyle } from "../style/geoLineStyle";
import { GeoPointStyle } from "../style/geoPointStyle";
import { GeoTextStyle } from "../style/geoTextStyle";
import { GeoShieldStyle } from "../style/geoShieldStyle";

export class StyleJsonCacheItem {
    public dataLayerName: string;
    // public minZoom: number;
    // public maxZoom: number;
    public zoomArr: Array<number>;
    public zIndex: any; // string||number
    public styleFirst: boolean;
    public filterGroup: any; // Array of filters,

    public geoStyle: GeoStyle;
    public childrenGeoStyles: GeoStyle[];
    public subStyleCacheItems: StyleJsonCacheItem[];

    constructor(styleJson: any, zoomArr, dataLayerColumnName) {
        this.childrenGeoStyles = [];
        this.subStyleCacheItems = [];
        // this.minZoom = minZoom;
        // this.maxZoom = maxZoom;
        this.zoomArr = zoomArr
        this.zIndex = styleJson["z-index"];
        this.styleFirst = styleJson["style-first"];
        this.filterGroup = this.createFilters(styleJson.filter, dataLayerColumnName) || [];
        this.createSubItems(styleJson, dataLayerColumnName);
        this.geoStyle = this.createGeoStyle(styleJson);
        this.createChildrenGeoStyle(styleJson);
    }

    createFilters(filterString, dataLayerColumnName) {
        let filterGroup = [];
        // let tempMinZoom = this.maxZoom;
        // let tempMaxZoom = this.minZoom;
        let tempZoomArr = this.zoomArr;
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
                let dataLayerNameFilter: GeoStringAttributeFilter;

                for (let i = 0; i < results.length; i++) {
                    if (results[i]) {
                        let filterItem = GeoFilterItem.createFilterItem(results[i]);

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
                        if(minZ < 0){
                            minZ = 0;
                        }
                        if(maxZ > 24){
                            maxZ = 24;
                        }
                        for(var j = minZ; j <= maxZ; j++){
                            if(!this.zoomArr.includes(j)){
                                this.zoomArr.push(j);
                            }
                        }
                        // if (minZ <= tempMinZoom) {
                        //     tempMinZoom = minZ;
                        // }
                        // if (maxZ >= tempMaxZoom) {
                        //     tempMaxZoom = maxZ;
                        // }
                    }
                    else {
                        geoZoomFilter.allowedValues.forEach(function(item){
                            if(!this.zoomArr.includes(item)){
                                this.zoomArr.push(item);
                            }
                        }.bind(this));
                        // let z = +geoZoomFilter.allowedValues[0];
                        // if (z <= tempMinZoom) {
                        //     tempMinZoom = z;
                        // }
                        // if (z >= tempMaxZoom) {
                        //     tempMaxZoom = z;
                        // }
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
        // if (tempMaxZoom !== this.minZoom || tempMinZoom !== this.maxZoom) {
        //     this.maxZoom = tempMaxZoom;
        //     this.minZoom = tempMinZoom;
        // }
        return filterGroup;
    }

    createSubItems(styleJson, dataLayerColumnName) {
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
            // let subItemMinZoom;
            // let subItemMaxZoom;
            var subItemZoomArr = [];
            for (let subStyle of styleJson.style) {
                let styleJsonCacheSubItem = new StyleJsonCacheItem(subStyle, this.zoomArr, dataLayerColumnName);
                this.zoomArr.forEach(function(item){
                    if(!subItemZoomArr.includes(item)){
                        subItemZoomArr.push(item);
                    }
                })
                // if (subItemMaxZoom === undefined || styleJsonCacheSubItem.maxZoom > subItemMaxZoom) {
                //     subItemMaxZoom = styleJsonCacheSubItem.maxZoom;
                // }
                // if (subItemMinZoom === undefined || styleJsonCacheSubItem.minZoom < subItemMinZoom) {
                //     subItemMinZoom = styleJsonCacheSubItem.minZoom;
                // }

                this.subStyleCacheItems.push(styleJsonCacheSubItem);
            }
            this.zoomArr = subItemZoomArr;

            // if (subItemMinZoom && subItemMinZoom > this.minZoom) {
            //     this.minZoom = subItemMinZoom;
            // }
            // if (subItemMaxZoom && subItemMaxZoom < this.maxZoom) {
            //     this.maxZoom = subItemMaxZoom;
            // }
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
