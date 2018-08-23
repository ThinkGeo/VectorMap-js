import * as earcut from 'earcut';

const createCanvasContext2D = () => document.createElement('canvas').getContext('webgl');

const getPolygonIndex = coordinates => {
    let arr = earcut(coordinates);
    if (arr.length === 0) {
        arr = [0, 1, 2];
    }

    return arr;
}

export {
    createCanvasContext2D,
    getPolygonIndex
}