import GeoTextStyle from '../style/geoTextStyle';

class StyleJsonCache {

    constructor() {
        this.geoStyleGroupByZoom = [];
        this.styleJson = {};
        this.geoStyles = {};
        this.geoTextStyleInfo = {};
    }

    add(zoom, dataLayerName, tree) {
        if (this.geoStyleGroupByZoom[zoom] === undefined) {
            this.geoStyleGroupByZoom[zoom] = {};
        }
        if (this.geoStyleGroupByZoom[zoom] === undefined) {
            this.geoStyleGroupByZoom[zoom] = {};
        }
        if (this.geoStyleGroupByZoom[zoom][dataLayerName] === undefined) {
            this.geoStyleGroupByZoom[zoom][dataLayerName] = [];
        }
        this.geoStyleGroupByZoom[zoom][dataLayerName].push(tree);

        this.readGeoStyleFromTree(tree);
    }

    readGeoStyleFromTree(tree) {
        return this.readGeoStyleFromTreeNode(tree.root);
    }

    readGeoStyleFromTreeNode(node) {
        let result = [];
        if (node.data.geoStyle) {
            this.geoStyles[node.data.geoStyle.id] = node.data.geoStyle;
            // get the widths of GeoTextStyle
            if (node.data.geoStyle instanceof GeoTextStyle) {
                this.geoTextStyleInfo[node.data.geoStyle.id] = node.data.geoStyle.charWidths;
            }
        }
        if (node.data.childrenGeoStyles && node.data.childrenGeoStyles.length > 0) {
            for (let i = 0; i < node.data.childrenGeoStyles.length; i++) {
                this.geoStyles[node.data.childrenGeoStyles[i].id] = node.data.childrenGeoStyles[i];
                if (node.data.childrenGeoStyles[i] instanceof GeoTextStyle) {
                    this.geoTextStyleInfo[node.data.childrenGeoStyles[i].id] = node.data.childrenGeoStyles[i];
                }
            }
        }
        if (node.children && node.children.length > 0) {
            for (let i = 0; i < node.children.length; i++) {
                this.readGeoStyleFromTreeNode(node.children[i]);
            }
        }
        return result;
    }

    clear() {
        this.geoStyleGroupByZoom.length = 0;
    }

}

export default StyleJsonCache;