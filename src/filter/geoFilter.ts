import { GeoFilterItem } from "./geoFilterItem";

export abstract class GeoFilter {
    public initialized: boolean;
    public filterItems: GeoFilterItem[];
    public replacedValueToIndex: boolean;

    public key: any;
    public keyIndex: number;

    constructor(filterItems: GeoFilterItem[]) {
        this.filterItems = filterItems || [];
        this.replacedValueToIndex = false;
    }

    addFilterItem(filterItem: GeoFilterItem) {
        this.filterItems.push(filterItem);
    }

    initialize() {
        this.initializeCore();
        this.initialized = true;
    }

    initializeCore() { }

    matchOLFeature(feature: ol.Feature, zoom: number): boolean {
        if (!this.initialized) {
            this.initialize();
        }
        return this.matchFeatureCore(feature, zoom);
    }

    replaceVaulesToPbfIndex(pbfLayer: any) {
        this.replaceVaulesToPbfIndexCore(pbfLayer);
    }

    abstract matchFeatureCore(feature: ol.Feature, zoom: number): boolean;
    abstract replaceVaulesToPbfIndexCore(pbfLayer: any);
}