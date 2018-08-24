import * as earcut from 'earcut';

const createCanvasContext2D = () => document.createElement('canvas').getContext('webgl');

const getPolygonIndex = coordinates => {
    let arr = earcut(coordinates);
    return arr;
}

export {
    createCanvasContext2D,
    getPolygonIndex
}