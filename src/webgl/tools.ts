import * as earcut from 'earcut';

const createCanvasContext2D = () => document.createElement('canvas').getContext('webgl');

const getPolygonIndex = coordinates => {
    let arr = earcut(coordinates);
    return arr;
}

const colorStrToWebglColor = (str: string): Array<Number> => {
    let color = [];
    let strColor = str.match(/[\d\.]+/mg);
    if(+strColor[3] !== 1){
        const A1 = +strColor[3];
        const R3 = +strColor[0] * A1 + 240 * (1 - A1); //240  238  232
        const G3 = +strColor[1] * A1 + 238 * (1 - A1); //240  238  232
        const B3 = +strColor[2] * A1 + 232 * (1 - A1); //240  238  232
        const A3 = 1;
        strColor[0] = R3.toString();
        strColor[1] = G3.toString();
        strColor[2] = B3.toString();
        strColor[3] = A3.toString();
    }

    color = strColor.map((val, index) => {
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