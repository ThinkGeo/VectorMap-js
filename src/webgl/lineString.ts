import createProgram from './initShader';

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
    let {
        webglLineIndex,
        webglProgram
    } = data;

    if(webglProgram===undefined){
        webglProgram = createProgram(gl, v_shader_source, f_shader_source);
        (<any>ol).webglContext['lineProgram']=webglProgram;
    }
    gl.useProgram(webglProgram);
    const a_Position = gl.getAttribLocation(webglProgram, 'a_Position');
    const a_Color = gl.getAttribLocation(webglProgram, 'a_Color');

    
    let multiplyLine = webglLineIndex.multiplyLine;
    let lines = webglLineIndex.lines;

    let buffer = gl.createBuffer();
    let indexBuffer = gl.createBuffer();
    let colorBuffer = gl.createBuffer();
    
    multiplyLine.indexArr.forEach((val, index) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, multiplyLine.coordinatesArr[index], gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, multiplyLine.colorArr[index], gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, val, gl.DYNAMIC_DRAW);
        gl.drawElements(4, val.length, gl.UNSIGNED_SHORT, 0);
    });

    lines.indexArr.forEach((val, index) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, lines.coordinatesArr[index], gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, lines.colorArr[index], gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, val, gl.DYNAMIC_DRAW);

        gl.drawElements(1, val.length, gl.UNSIGNED_SHORT, 0);
    });

    gl.disableVertexAttribArray(a_Position);
    gl.disableVertexAttribArray(a_Color);
    gl.deleteBuffer(buffer);
    gl.deleteBuffer(colorBuffer);
    gl.deleteBuffer(indexBuffer);
}

export default drawLineString;