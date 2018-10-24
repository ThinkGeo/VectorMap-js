export class GeoFilterItem {

    constructor(key, operator, value) {
        this.key = key;
        this.operator = operator;
        this.value = value;
        this.operatorRegex = new RegExp("[<>!=]+", "g");
    }
    
}

GeoFilterItem["operatorRegex"] = function () {
    return new RegExp("[<>!=]+", "g");
}

GeoFilterItem["createFilterItem"] = function (filterItemString) {
    let operator = filterItemString.match(GeoFilterItem["operatorRegex"]())[0];
    let parts = filterItemString.split(operator);
    let item = new GeoFilterItem(parts[0], operator, parts[1]);
    return item;
}

export default GeoFilterItem;