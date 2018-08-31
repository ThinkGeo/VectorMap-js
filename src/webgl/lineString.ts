import createProgram from './initShader';
import { colorStrToWebglColor } from './tools';
import getPathOffset from './calcLinePath';

const v_shader_source = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;

    varying vec4 v_Color;
    void main(){
        gl_Position = a_Position;
        gl_PointSize = 10.0;
        v_Color = a_Color;
    }
`;

const f_shader_source = `
    precision mediump float;
    varying vec4 v_Color;
    void main(){
        gl_FragColor = v_Color;
    }
`;

const drawLineString = (gl, data) => {
    const program = createProgram(gl, v_shader_source, f_shader_source);
    gl.useProgram(program);
    const a_Position = gl.getAttribLocation(program, 'a_Position');
    const a_Color = gl.getAttribLocation(program, 'a_Color');

    let {
        coordinates,
        webglEnds,
        webglStyle,
        canvasSize
    } = data;

    let lines = {
        indexArr: [],
        coordinatesArr: [],
        colorArr: []
    }

    let multiplyLine = {
        indexArr: [],
        coordinatesArr: [],
        colorArr: []
    }

    let lineArr = [];
    let lineIndexArr = [];
    let lineColorArr = [];

    let mutiLineArr = [];
    let mutiLineIndexArr = [];
    let mutiLineColorArr = [];

    for (let i = 0, length = webglEnds.length, prevEnd = 0; i < length; i++) {

        let coord = coordinates.slice(prevEnd, webglEnds[i]);
        let webglColor = colorStrToWebglColor(webglStyle[i].strokeStyle);

        if (webglStyle[i].lineWidth === 1) {
            let lastLength = lineArr.length / 2;
            lineArr = lineArr.concat(coord);
            let currentLength = lineArr.length / 2;

            while (lastLength < currentLength - 1) {
                lineIndexArr.push(lastLength++, lastLength);
                lineColorArr.push(...webglColor);
            }
            lineColorArr.push(...webglColor);  //last time

            if (lineColorArr.length > 2500) {
                lines.indexArr.push(lineIndexArr);
                lines.coordinatesArr.push(lineArr);
                lines.colorArr.push(lineColorArr);

                lineIndexArr = [];
                lineArr = [];
                lineColorArr = [];
            }
        } else if (webglStyle[i].lineWidth !== 1) {
            let widthHalf = webglStyle[i].lineWidth / (canvasSize[0] / 2) / 2;
            let lastLength = mutiLineArr.length / 2;
            let [tempCoordinates, tempIndex] = getPathOffset(coord, widthHalf);
            mutiLineArr = mutiLineArr.concat(tempCoordinates);
            let currentLength = mutiLineArr.length / 2;

            for (let i = 0, length = tempIndex.length; i < length; i++) {
                mutiLineIndexArr.push(lastLength + tempIndex[i]);
            }

            while (lastLength++ < currentLength) {
                mutiLineColorArr.push(...webglColor);
            }

            if (mutiLineArr.length > 2500) {
                multiplyLine.indexArr.push(mutiLineIndexArr);
                multiplyLine.coordinatesArr.push(mutiLineArr);
                multiplyLine.colorArr.push(mutiLineColorArr);

                mutiLineIndexArr = [];
                mutiLineArr = [];
                mutiLineColorArr = [];
            }

        }

        prevEnd = webglEnds[i];
    }

    lines.indexArr.push(lineIndexArr);
    lines.coordinatesArr.push(lineArr);
    lines.colorArr.push(lineColorArr);

    lineIndexArr = [];
    lineArr = [];
    lineColorArr = [];

    if (mutiLineIndexArr.length > 0) {
        multiplyLine.indexArr.push(mutiLineIndexArr);
        multiplyLine.coordinatesArr.push(mutiLineArr);
        multiplyLine.colorArr.push(mutiLineColorArr);

        mutiLineIndexArr = null;
        mutiLineArr = null;
        mutiLineColorArr = null;
    }


    let buffer = gl.createBuffer();
    let indexBuffer = gl.createBuffer();
    let colorBuffer = gl.createBuffer();

    multiplyLine.indexArr.forEach((val, index) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(multiplyLine.coordinatesArr[index]), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(multiplyLine.colorArr[index]), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(val), gl.DYNAMIC_DRAW);

        gl.drawElements(4, val.length, gl.UNSIGNED_SHORT, 0);
    });

    lines.indexArr.forEach((val, index) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines.coordinatesArr[index]), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines.colorArr[index]), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(val), gl.DYNAMIC_DRAW);

        gl.drawElements(1, val.length, gl.UNSIGNED_SHORT, 0);
    });
}

export default drawLineString;