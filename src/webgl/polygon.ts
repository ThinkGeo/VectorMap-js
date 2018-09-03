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
        webglStyle,
        webglIndexObj
    } = data;
    let obj = {
        indexArr: [],
        coordinatesIndexArr: [],
        colorArr: []
    }

    for (let i = 0, prev = 0, lastIndex = 0, index = [], color = [], length = webglEnds.length; i < length; i++) {
        let end = webglEnds[i];
        let tempIndex = getPolygonIndex(coordinates.slice(prev, end));
        let t1 = (prev - lastIndex) * 2;
        let t2 = (end - lastIndex) * 2;
        
        let webglColor = colorStrToWebglColor(webglStyle[i].color);
        while (t1 < t2) {
            color.push(...webglColor);
            t1 += 4;
        }

        if (tempIndex.length > 0 || i ===length -1) {
            tempIndex = tempIndex.map(val => val + (prev - lastIndex) / 2);
            index.push(...tempIndex);
            if (color.length > 2500 || i === length - 1) {
                // obj.indexArr.push(index.slice(0));
                obj.indexArr.push([...index]);
                // obj.colorArr.push(color.slice(0));
                obj.colorArr.push([...color]);
                obj.coordinatesIndexArr.push([lastIndex, end]);
                lastIndex = end;
                index.length = 0;
                color.length = 0;
            }
        }

        prev = end;
    }

    let buffer = gl.createBuffer();
    let colorBuffer = gl.createBuffer();
    let indexBuffer = gl.createBuffer();
    gl.getExtension('OES_element_index_uint');

    obj.indexArr.forEach((val, index) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        let position = coordinates.slice.apply(coordinates, obj.coordinatesIndexArr[index]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.colorArr[index]), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(val), gl.DYNAMIC_DRAW);

        gl.drawElements(4, val.length, gl.UNSIGNED_INT, 0);
    })
}

export default drawPolygonGl;