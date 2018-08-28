import { getPolygonIndex, colorStrToWebglColor } from './tools';
import createProgram from './initShader';

const v_shader_source = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;

    varying vec4 v_Color;
    void main(){
        gl_Position = a_Position;
        gl_PointSize = 1.5;
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

const drawPolygonGl = (gl, data) => {
    const program = createProgram(gl, v_shader_source, f_shader_source);
    gl.useProgram(program);
    const a_Position = gl.getAttribLocation(program, 'a_Position');
    const a_Color = gl.getAttribLocation(program, 'a_Color');

    let {
        coordinates,
        webglEnds,
        webglStyle
    } = data;
    let index = [];
    let allIndexArr = [];
    let allCoordinateArr = [];
    let allColorArr = [];

    let colorArr = [];
    let coordinateStart = 0;
    webglEnds.reduce((pre, current, currentIndex) => {
        let coords = coordinates.slice(pre, current);

        let distance = (current - pre) / 2;
        let color = webglStyle[currentIndex].color;
        color = colorStrToWebglColor(color);
        while (distance-- > 0) {
            colorArr.push(...color);
        }

        let tempOffset = (pre - coordinateStart) / 2;
        let temp = getPolygonIndex(coords);
        if (temp.length === 0) return current;
        temp = temp.map(val => tempOffset + val);
        index = index.concat(temp);
        if (index.length > 2500) {
            allIndexArr.push([...index]);
            allCoordinateArr.push(coordinates.slice(coordinateStart, current));
            coordinateStart = current;
            index.length = 0;
            allColorArr.push([...colorArr]);
            colorArr.length = 0;
        }
        return current;
    }, 0);
    (index.length > 0) && allIndexArr.push(index);
    allCoordinateArr.push(coordinates.slice(coordinateStart));
    allColorArr.push(colorArr);

    let buffer = gl.createBuffer();
    let colorBuffer = gl.createBuffer();

    let indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    var ext = gl.getExtension('OES_element_index_uint');
    allIndexArr.forEach((val, index) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allCoordinateArr[index]), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allColorArr[index]), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(val), gl.DYNAMIC_DRAW);
        gl.drawElements(4, val.length, gl.UNSIGNED_INT, 0);
    })
}

export default drawPolygonGl;