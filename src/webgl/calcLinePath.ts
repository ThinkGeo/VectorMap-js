const normalize = function (x, y) {
  var m = Math.sqrt(x * x + y * y);
  return { x: x / m, y: y / m }
}
const getPathCoordinate = function (a_position, a_positionNext, a_positionPrev, a_offset) {
  var pointss = [];
  var length = a_position.length;
  var flag = 1;
  for (var i = 0; i < length; i += 3) {
    var curr = { x: a_position[i], y: a_position[i + 1] }
    var next = { x: a_positionNext[i], y: a_positionNext[i + 1] }
    var prev = { x: a_positionPrev[i], y: a_positionPrev[i + 1] }
    var dir, len = a_offset * flag;
    if (curr.x === prev.x && curr.y === prev.y) {
      dir = normalize(next.x - curr.x, next.y - curr.y);
    }
    else if (curr.x === next.x && curr.y === next.y) {
      dir = normalize(curr.x - prev.x, curr.y - prev.y)
    }
    else {
      var dir1 = normalize(curr.x - prev.x, curr.y - prev.y)
      var dir2 = normalize(next.x - curr.x, next.y - curr.y)
      dir = normalize(dir1.x + dir2.x, dir1.y + dir2.y);
      var miter = 1.0 / Math.max(dir.x * dir1.x + dir.y * dir1.y, 0.5);
      len *= miter;
    }
    dir = { x: -dir.y * len, y: dir.x * len };
    pointss.push(curr.x + dir.x);
    pointss.push(curr.y + dir.y);
    flag *= -1;
  }
  return pointss
}
const getPathOffset = function (points, offset) {
  var len = points.length / 2;
  var count = len * 3 * 2;
  var position = [];
  var positionPrev = [];
  var positionNext = [];
  if(len===2 && points[0]===points[2] && points[1]===points[3]){
    return [[],[]];
  }
  // var position = new Float32Array(count);
  // var positionPrev = new Float32Array(count);
  // var positionNext = new Float32Array(count);
  // var color = new Float32Array(len * 4 * 2);
  var indicesCount = 3 * 2 * (len - 1);
  var triangleOffset = 0, vertexOffset = 0, colorOffset = 0;
  for (var i = 0; i < len; i++) {
    var i3 = i * 3 * 2;
    var i4 = i * 4 * 2;
    var pointX = points[2 * i];
    var pointY = points[2 * i + 1]
    if(pointX===points[2*i+2] && pointY===points[2*i+3]){
      indicesCount-=6;
      continue;
    }
    position[i3 + 0] = pointX;
    position[i3 + 1] = pointY;
    position[i3 + 2] = 0;
    position[i3 + 3] = pointX;
    position[i3 + 4] = pointY;
    position[i3 + 5] = 0;
    // color[i4 + 0] = pcolor[0];
    // color[i4 + 1] = pcolor[1];
    // color[i4 + 2] = pcolor[2];
    // color[i4 + 3] = pcolor[3];
    // color[i4 + 4] = pcolor[0];
    // color[i4 + 5] = pcolor[1];
    // color[i4 + 6] = pcolor[2];
    // color[i4 + 7] = pcolor[3];
    if (i < count - 1) {
      var i3p = i3 + 6;
      positionNext[i3p + 0] = pointX;
      positionNext[i3p + 1] = pointY;
      positionNext[i3p + 2] = 0;

      positionNext[i3p + 3] = pointX;
      positionNext[i3p + 4] = pointY;
      positionNext[i3p + 5] = 0;
    }
    if (i > 0) {
      var i3n = i3 - 6;
      positionPrev[i3n + 0] = pointX;
      positionPrev[i3n + 1] = pointY;
      positionPrev[i3n + 2] = 0;

      positionPrev[i3n + 3] = pointX;
      positionPrev[i3n + 4] = pointY;
      positionPrev[i3n + 5] = 0;
    }
    var idx = 3 * i;
    var i2 = i * 2;
  }

  var indices = new Uint16Array(indicesCount);
  var end = count - 1;
  for (i = 0; i < 6; i++) {
    positionNext[i] = positionNext[i + 6];
    positionPrev[end - i] = positionPrev[end - i - 6];
  }
  for (i = 0; i < indicesCount; i++) {
    if (i % 2 == 0) {
      indices[triangleOffset++] = i;
      indices[triangleOffset++] = i + 1;
      indices[triangleOffset++] = i + 2;
    } else {
      indices[triangleOffset++] = i + 1;
      indices[triangleOffset++] = i;
      indices[triangleOffset++] = i + 2;
    }
  }

  var coordinates = getPathCoordinate(position, positionNext, positionPrev, offset)
  // return {
  //   coordinates: coordinates,
  //   indices: indices,
  // }
  return [coordinates, indices]
};

export default getPathOffset;