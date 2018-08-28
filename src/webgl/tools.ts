import * as earcut from 'earcut';

const createCanvasContext2D = () => document.createElement('canvas').getContext('webgl');

const getPolygonIndex = coordinates => {
    let arr = earcut(coordinates);
    return arr;
}

const colorStrToWebglColor = (str: string): Array<Number> => {
    let color = str.match(/[\d\.]+/mg).map((val, index) => {
        if (index !== 3) return +val / 255;
        return +val;
    });
    return color;
};


export {
    createCanvasContext2D,
    getPolygonIndex,
    colorStrToWebglColor
}