import { getPolygonIndex } from './tools';

const v_shader_source = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;

    varying vec4 v_Color;
    void main(){
        gl_Position = a_Position;
        gl_PointSize = 1.0;
    }
`;

const f_shader_source = `
    precision mediump float;

    varying vec4 a_Color;
    void main(){
        gl_FragColor = vec4(1.0,0.0,0.0,2.0);
    }
`;

const loadShader = (gl, type, sourceCode) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);
    let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        let error = gl.getShaderInfoLog(shader);
        console.log(error);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

const createProgram = (gl, v_shader_source, f_shader_source) => {
    const program = gl.createProgram();
    gl.attachShader(program, loadShader(gl, gl.VERTEX_SHADER, v_shader_source));
    gl.attachShader(program, loadShader(gl, gl.FRAGMENT_SHADER, f_shader_source));
    gl.linkProgram(program);

    let linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        console.log(gl.getProgramInfoLog(program));
    }
    return program;
}


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
        let temp = getPolygonIndex(coords).map(val => offset + val);
        index = index.concat(temp);
        if (index.length > 2500) {
            sum.push([...index]);
            index.length = 0;
        }
        return current;
    }, 0);
    index.length > 0 && sum.push(index);

    console.log(sum.length)
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coordinates), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    let indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    sum.forEach(index => {
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(index), gl.DYNAMIC_DRAW);

        gl.drawElements(4, index.length, gl.UNSIGNED_SHORT, 0);
    })


}

export default drawPolygonGl;