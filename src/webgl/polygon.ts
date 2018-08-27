import { getPolygonIndex } from './tools';
import createProgram from './initShader';

const v_shader_source = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;

    varying vec4 v_Color;
    void main(){
        gl_Position = a_Position;
        gl_PointSize = 1.5;
    }
`;

const f_shader_source = `
    precision mediump float;

    varying vec4 a_Color;
    void main(){
        gl_FragColor = vec4(1.0,1.0,1.0,1);
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
        color
    } = data;
    let index = [];
    let sum = [];
    webglEnds.reduce((pre, current) => {
        let coords = coordinates.slice(pre, current);
        let offset = pre / 2;
        let temp = getPolygonIndex(coords);
        if (temp.length === 0) return current;
        temp = temp.map(val => offset + val);
        index = index.concat(temp);
        if (index.length > 2500) {
            sum.push([...index]);
            index.length = 0;
        }
        return current;
    }, 0);
    (index.length > 0) && sum.push(index);

    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coordinates), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    let indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    var ext = gl.getExtension('OES_element_index_uint');
    sum.forEach(index => {
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(index), gl.DYNAMIC_DRAW);
        gl.drawElements(4, index.length, gl.UNSIGNED_INT, 0);
    })
}

export default drawPolygonGl;