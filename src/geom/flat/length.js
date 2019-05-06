export function lineString(flatCoordinates, offset, end, stride, resolution) {
  var x1 = flatCoordinates[offset];
  var y1 = flatCoordinates[offset + 1];
  var length = 0;
  var i;
  for (i = offset + stride; i < end; i += stride) {
      var x2 = flatCoordinates[i];
      var y2 = flatCoordinates[i + 1];
      length += (Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) / resolution);
      x1 = x2;
      y1 = y2;
  }
  return length;
};