import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getConceptProblemTypeBoosters, getExerciseTypePool, getModuleFromConcept, getModuleProblemTypes, moduleProblemTypePools } from '../src/utils/exerciseTypeTaxonomy.js';

assert.equal(getModuleFromConcept('pythagoras', 'Pythagorean Theorem'), 'geometry');
assert.equal(getModuleFromConcept('data-collection', 'Data Collection & Organisation'), 'statistics');
assert.ok(getConceptProblemTypeBoosters('pythagoras', 'Pythagorean Theorem').length >= 8);
assert.ok(getConceptProblemTypeBoosters('circles', 'Circles').length >= 8);
assert.ok(getConceptProblemTypeBoosters('quadratic-equations', 'Quadratic Equations').length >= 8);
assert.ok(getConceptProblemTypeBoosters('statistics', 'Data Collection & Organisation').length >= 8);

const graphText = readFileSync(new URL('../src/data/knowledgeGraph.ts', import.meta.url), 'utf8');
const conceptMatches = [...graphText.matchAll(/id:\s*'([^']+)'\s*,[\s\S]*?title:\s*\{[\s\S]*?en:\s*'([^']+)'[\s\S]*?\}[\s\S]*?module:\s*'([^']+)'/g)];
const moduleIds = [...new Set(conceptMatches.map((match) => match[3]))];

for (const moduleId of moduleIds) {
  const pool = getModuleProblemTypes(moduleId);
  assert.ok(pool.length >= 8, `module ${moduleId} should have at least 8 problem types`);
}

for (const [, conceptId, conceptTitle, moduleId] of conceptMatches) {
  const easyPool = getExerciseTypePool(conceptId, conceptTitle, 'Easy', moduleId);
  const mediumPool = getExerciseTypePool(conceptId, conceptTitle, 'Medium', moduleId);
  const hardPool = getExerciseTypePool(conceptId, conceptTitle, 'Hard', moduleId);
  assert.ok(easyPool.length >= 30, `${conceptId} easy pool should have at least 30 types`);
  assert.ok(mediumPool.length >= 30, `${conceptId} medium pool should have at least 30 types`);
  assert.ok(hardPool.length >= 30, `${conceptId} hard pool should have at least 30 types`);
}

assert.ok(Object.keys(moduleProblemTypePools).length >= 5);

console.log('exercise type taxonomy test passed');
