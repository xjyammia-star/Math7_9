export function explicitLabel(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return trimmed === '' ? '' : trimmed;
}

export function explicitLabels(value, count) {
  const labels = Array.isArray(value) ? value : [];
  return Array.from({ length: count }, (_, index) => explicitLabel(labels[index]));
}

function isUnknownPlaceholder(value) {
  return typeof value === 'string' && ['?', '？'].includes(value.trim());
}

function sanitizeNode(node) {
  if (Array.isArray(node)) {
    return node
      .map((entry) => sanitizeNode(entry))
      .filter((entry) => entry !== null && entry !== undefined);
  }

  if (isUnknownPlaceholder(node)) {
    return '';
  }

  if (!node || typeof node !== 'object') {
    return node;
  }

  const sanitized = {};

  Object.entries(node).forEach(([key, value]) => {
    if (key === 'text') {
      if (isUnknownPlaceholder(value) || String(value ?? '').trim() === '') return;
      sanitized[key] = value;
      return;
    }

    if (key === 'label' || key.startsWith('label_')) {
      if (isUnknownPlaceholder(value)) {
        sanitized[key] = '';
        return;
      }
      sanitized[key] = value;
      return;
    }

    if (key === 'labels' && value && typeof value === 'object') {
      const sanitizedLabels = {};
      Object.entries(value).forEach(([labelKey, labelValue]) => {
        sanitizedLabels[labelKey] = isUnknownPlaceholder(labelValue) ? '' : labelValue;
      });
      sanitized[key] = sanitizedLabels;
      return;
    }

    sanitized[key] = sanitizeNode(value);
  });

  if (sanitized.kind === 'text' && !sanitized.text) {
    return null;
  }

  return sanitized;
}

export function stripUnknownDiagramLabels(spec) {
  return sanitizeNode(spec);
}
