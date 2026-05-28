function explicitText(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return trimmed === '' ? '' : trimmed;
}

function explicitBoolean(value) {
  return value === true;
}

export function getLinearFunctionAnnotations(data = {}) {
  const showInterceptDots = explicitBoolean(data.show_intercepts) || explicitBoolean(data.show_coordinate_labels);
  return {
    xInterceptLabel: showInterceptDots ? explicitText(data.label_x_intercept) : '',
    yInterceptLabel: showInterceptDots ? explicitText(data.label_y_intercept) : '',
    showInterceptDots,
  };
}

export function getQuadraticFunctionAnnotations(data = {}) {
  const showVertexDot = explicitBoolean(data.show_vertex) || explicitBoolean(data.show_vertex_dot);
  return {
    vertexLabel: showVertexDot ? explicitText(data.label_vertex) : '',
    showVertexDot,
  };
}
