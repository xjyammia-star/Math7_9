export function explicitLabel(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return trimmed === '' ? '' : trimmed;
}

export function explicitLabels(value, count) {
  const labels = Array.isArray(value) ? value : [];
  return Array.from({ length: count }, (_, index) => explicitLabel(labels[index]));
}
