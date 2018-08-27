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

export default createProgram;