import createProgram from './initShader';

const v_shader_source = `
    attribute vec4 a_Position;
    // attribute vec4 a_Color;

    // varying vec4 v_Color;
    void main(){
        gl_Position = a_Position;
        gl_PointSize = 3.0;
    }
`;

const f_shader_source = `
    precision mediump float;
    uniform vec4 u_Color;
    // varying vec4 v_Color;
    void main(){
        gl_FragColor = u_Color;
    }
`;

const drawLineString = (gl, data) => {
    const program = createProgram(gl, v_shader_source, f_shader_source);
    gl.useProgram(program);
    const a_Position = gl.getAttribLocation(program, 'a_Position');
    const u_Color = gl.getUniformLocation(program, 'u_Color');

    let {
        coordinates,
        webglEnds,
        color = [1.0, 0.0, 1.0, 1.0]
    } = data;

    let index = [];
    let tempIndexArr = [];
    webglEnds.reduce((pre, current) => {
        pre /= 2;
        let temp = current;
        temp /= 2;
        while (pre + 1 < temp) {
            tempIndexArr.push(pre++, pre);
        }
        if (tempIndexArr.length > 2500) {
            index.push(tempIndexArr);
            tempIndexArr = [];
        }
        return current;
    }, 0)
    index.push(tempIndexArr);

    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coordinates), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    let indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // gl.uniform4fv(u_Color, new Float32Array([0.6666666666666666, 0.7764705882352941, 0.9333333333333333, 1.0]));
    gl.uniform4fv(u_Color, new Float32Array([0.6666666666666666, 0, 0.9333333333333333, 1.0]));


    index.forEach(val => {
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(val), gl.DYNAMIC_DRAW);
        // console.log(val, coordinates);
        gl.drawElements(1, val.length, gl.UNSIGNED_SHORT, 0);
    })
}

export default drawLineString;