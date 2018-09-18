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
    let {
        webglIndexObj,
        webglProgram
    } = data;

    if(webglProgram===undefined){
        webglProgram = createProgram(gl, v_shader_source, f_shader_source);
        (<any>ol).webglContext['polyProgram']=webglProgram;
    }

    gl.useProgram(webglProgram);
    const a_Position = gl.getAttribLocation(webglProgram, 'a_Position');
    const a_Color = gl.getAttribLocation(webglProgram, 'a_Color');

    let buffer = gl.createBuffer();
    let colorBuffer = gl.createBuffer();
    let indexBuffer = gl.createBuffer();
    gl.getExtension('OES_element_index_uint');

    webglIndexObj.indexArr.forEach((val, index) => {        
        let length=val.length;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, webglIndexObj.coordinatesIndexArr[index], gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, webglIndexObj.colorArr[index], gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, val, gl.DYNAMIC_DRAW);
        
        gl.drawElements(4, length, gl.UNSIGNED_INT, 0);        
    });

    gl.disableVertexAttribArray(a_Position);
    gl.disableVertexAttribArray(a_Color);
    gl.deleteBuffer(buffer);
    gl.deleteBuffer(colorBuffer);
    gl.deleteBuffer(indexBuffer);
}

export default drawPolygonGl;