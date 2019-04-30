export class GeoFilterItem {
    key: string;
    operator: string;
    value: string;

    constructor(key: string, operator: string, value: string) {
        this.key = key;
        this.operator = operator;
        this.value = value;
    }

    static operatorRegex = new RegExp("[<>!=]+", "g");
    public static createFilterItem(filterItemString: string) {
        let operator = filterItemString.match(this.operatorRegex)[0];
        let parts = filterItemString.split(operator);
        let item = new GeoFilterItem(parts[0], operator, parts[1]);
        return item;
    }
}