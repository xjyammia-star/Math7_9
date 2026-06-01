export function validateRenderContract(rendered, contract, kind) {
  const issues = [];
  if (!contract) return issues;

  if (Array.isArray(contract.questionIncludes)) {
    const hasQuestionFragment = contract.questionIncludes.some((fragment) => rendered.includes(fragment));
    if (!hasQuestionFragment) {
      issues.push(`${kind} question text does not contain an expected phrase`);
    }
  }

  if (Array.isArray(contract.diagramIncludes)) {
    contract.diagramIncludes.forEach((fragment) => {
      if (!rendered.includes(fragment)) {
        issues.push(`${kind} diagram is missing required fragment: ${fragment}`);
      }
    });
  }

  if (Array.isArray(contract.diagramExcludes)) {
    contract.diagramExcludes.forEach((fragment) => {
      if (rendered.includes(fragment)) {
        issues.push(`${kind} diagram should not include fragment: ${fragment}`);
      }
    });
  }

  return issues;
}
